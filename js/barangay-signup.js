import { SUPABASE_CONFIG } from './config.js';

const params = new URLSearchParams(location.search);
const requestedSlug = (params.get('barangay') || '').trim().toLowerCase();
const form = document.querySelector('#signup-form');
const status = document.querySelector('#signup-status');
const button = document.querySelector('#signup-button');
const title = document.querySelector('#signup-title');
const subtitle = document.querySelector('#signup-subtitle');
const back = document.querySelector('#back-login');
const barangaySelect = document.querySelector('#barangay');
const idInput = document.querySelector('#valid-id');
const selfieInput = document.querySelector('#selfie');
let targetBarangay = null;
let barangays = [];
const MAX_BYTES = 1048576;
const TARGET_BYTES = 900 * 1024;
const MAX_DIM = 2200;

const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function show(message, error = false) {
  status.hidden = false;
  status.textContent = message;
  status.dataset.state = error ? 'error' : 'ok';
}
function capacity(b) { return Number(b?.admin_slots_used || 0); }
function setInputsDisabled(disabled) {
  [...form.querySelectorAll('input,textarea,select')].forEach(el => {
    if (el !== barangaySelect) el.disabled = disabled;
  });
  barangaySelect.disabled = disabled;
}
function setTarget(b) {
  targetBarangay = b || null;
  if (!targetBarangay) { button.disabled = true; return; }
  title.textContent = `${targetBarangay.name} Admin Sign up`;
  subtitle.textContent = `Request an admin account for ${targetBarangay.name}. Super Admin approval is required before login.`;
  if (back) back.href = `login.html?barangay=${encodeURIComponent(targetBarangay.slug)}`;
  const count = capacity(targetBarangay);
  const available = Math.max(0, 2 - count);
  button.disabled = available === 0;
  show(available > 0 ? (available === 1 ? '1 Admin slot available — you may request access.' : '2 Admin slots available — you may request access.') : 'Barangay Admin accounts are full. Only 2 admin accounts are available for this Barangay.', available === 0);
  setInputsDisabled(available === 0);
}
async function loadBarangays() {
  try {
    const r = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays?status=eq.active&select=id,name,slug,municipality,province,admin_slots_used&order=name.asc`, {headers:{apikey:SUPABASE_CONFIG.publishableKey}});
    if (!r.ok) throw new Error('Unable to load barangays.');
    barangays = await r.json();
    barangaySelect.innerHTML = '<option value="">Select a barangay…</option>' + barangays.map(b => `<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('');
    if (requestedSlug) {
      const match = barangays.find(b => b.slug === requestedSlug);
      if (match) { barangaySelect.value = match.id; setTarget(match); }
    }
    if (!barangays.length) show('No active barangays are available for admin requests.', true);
  } catch (e) {
    form.hidden = true;
    show(e.message || 'Unable to load barangays.', true);
  }
}
async function refreshTargetCapacity() {
  if (!targetBarangay) return;
  const r = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays?id=eq.${encodeURIComponent(targetBarangay.id)}&status=eq.active&select=id,name,slug,municipality,province,admin_slots_used&limit=1`, {headers:{apikey:SUPABASE_CONFIG.publishableKey}});
  if (!r.ok) throw new Error('Unable to recheck admin availability.');
  const row = (await r.json())[0];
  if (!row) throw new Error('Barangay is no longer available.');
  targetBarangay = row;
  const i = barangays.findIndex(b => b.id === row.id);
  if (i >= 0) barangays[i] = row;
  setTarget(row);
}
async function fileToCompressedBlob(file, label) {
  if (!file) throw new Error(`${label} is required.`);
  if (!file.type.startsWith('image/')) throw new Error(`${label} must be an image. PDF and other files are not accepted.`);
  if (file.size > 50 * 1024 * 1024) throw new Error(`${label} is too large to process. Please choose an image under 50 MB.`);
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error(`${label} is not a valid readable image.`); }
  let scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  let width = Math.max(1, Math.round(bitmap.width * scale));
  let height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', {alpha:false});
  let blob = null;
  for (let attempt = 0; attempt < 12; attempt++) {
    canvas.width = width; canvas.height = height;
    ctx.clearRect(0,0,width,height); ctx.drawImage(bitmap,0,0,width,height);
    const quality = Math.max(.42, .88 - attempt * .05);
    blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && blob.size <= TARGET_BYTES) break;
    if (attempt === 5) { width = Math.max(900, Math.round(width * .82)); height = Math.max(900, Math.round(height * .82)); }
    else if (attempt > 5) { width = Math.max(700, Math.round(width * .84)); height = Math.max(700, Math.round(height * .84)); }
  }
  bitmap.close();
  if (!blob || blob.size > MAX_BYTES) throw new Error(`${label} could not be compressed below 1 MB while keeping it readable. Please choose a clearer/smaller photo.`);
  return new File([blob], `${label.toLowerCase().replace(/\s+/g,'-')}.jpg`, {type:'image/jpeg',lastModified:Date.now()});
}
function preview(input, img) {
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) { img.style.display = 'none'; return; }
    if (!file.type.startsWith('image/')) { input.value = ''; img.style.display = 'none'; show('Images only. Please select a JPG, PNG, or WebP file.', true); return; }
    const url = URL.createObjectURL(file); img.src = url; img.style.display = 'block'; img.onload = () => URL.revokeObjectURL(url);
  });
}
preview(idInput, document.querySelector('#valid-id-preview'));
preview(selfieInput, document.querySelector('#selfie-preview'));
barangaySelect.addEventListener('change', () => setTarget(barangays.find(b => b.id === barangaySelect.value) || null));

async function upload(path, file, token) {
  const r = await fetch(`${SUPABASE_CONFIG.url}/storage/v1/object/admin-verification/${path}`, {method:'POST',headers:{apikey:SUPABASE_CONFIG.publishableKey,Authorization:`Bearer ${token}`,'Content-Type':file.type,'x-upsert':'false'},body:file});
  if (!r.ok) { let d={}; try{d=await r.json()}catch{} throw new Error(d.message || d.error || 'Unable to upload verification image.'); }
  return path;
}
async function removeFiles(paths, token) {
  for (const path of paths) {
    try { await fetch(`${SUPABASE_CONFIG.url}/storage/v1/object/admin-verification/${path}`, {method:'DELETE',headers:{apikey:SUPABASE_CONFIG.publishableKey,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({prefixes:[path]})}); } catch {}
  }
}
async function rpc(name, body, token) {
  const r = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/rpc/${name}`, {method:'POST',headers:{apikey:SUPABASE_CONFIG.publishableKey,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data = await r.json().catch(() => null);
  if (!r.ok) throw new Error(data?.message || data?.error || `Request failed (${r.status})`);
  return data;
}
form.addEventListener('submit', async e => {
  e.preventDefault();
  targetBarangay = barangays.find(b => b.id === barangaySelect.value) || null;
  if (!targetBarangay) { show('Select the barangay you want to administer.', true); return; }
  button.disabled = true;
  try {
    await refreshTargetCapacity();
    if (capacity(targetBarangay) >= 2) return;
    const full_name = document.querySelector('#full-name').value.trim();
    const designation = document.querySelector('#designation').value.trim();
    const mobile_number = document.querySelector('#mobile-number').value.trim();
    const application_reason = document.querySelector('#application-reason').value.trim();
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value;
    const confirm = document.querySelector('#confirm-password').value;
    if (!full_name || !designation || !mobile_number || !application_reason || !email || !password) throw new Error('Complete all required fields.');
    if (password !== confirm) throw new Error('Passwords do not match.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    const idFile = await fileToCompressedBlob(idInput.files?.[0], 'valid-id');
    const selfieFile = await fileToCompressedBlob(selfieInput.files?.[0], 'selfie');
    show('Creating your account and preparing verification files…');
    const auth = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/signup`, {method:'POST',headers:{apikey:SUPABASE_CONFIG.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({email,password,data:{full_name,barangay_id:targetBarangay.id,requested_role:'barangay_admin',designation,mobile_number,application_reason}})});
    const data = await auth.json().catch(() => null);
    if (!auth.ok) throw new Error(data?.error_description || data?.msg || 'Unable to create account.');
    const token = data?.access_token, uid = data?.user?.id;
    if (!token || !uid) throw new Error('Account was created, but this signup session cannot securely upload verification files. Please contact the Super Admin instead of resubmitting.');
    const paths = [];
    try {
      const idPath = `${uid}/valid-id.jpg`, selfiePath = `${uid}/selfie.jpg`;
      await upload(idPath,idFile,token); paths.push(idPath);
      await upload(selfiePath,selfieFile,token); paths.push(selfiePath);
      await rpc('request_barangay_admin',{target_barangay_id:targetBarangay.id},token);
      await rpc('update_admin_application_details',{p_designation:designation,p_mobile_number:mobile_number,p_application_reason:application_reason,p_valid_id_path:idPath,p_selfie_path:selfiePath},token);
    } catch (err) { await removeFiles(paths,token); throw err; }
    show(`Request submitted for ${targetBarangay.name}. Your ID and selfie were securely uploaded for Super Admin review.`);
    form.reset(); barangaySelect.value=''; targetBarangay=null; button.disabled=true; setInputsDisabled(false);
    await loadBarangays();
  } catch (err) {
    show(err instanceof Error ? err.message : 'Signup failed.', true);
    button.disabled = false;
  }
});
loadBarangays();
