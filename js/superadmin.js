import { SUPABASE_CONFIG } from './config.js';

const session = JSON.parse(sessionStorage.getItem('brgywebsaas_session') || 'null');
const welcome = document.querySelector('#welcome');
const list = document.querySelector('#barangays');
const form = document.querySelector('#barangay-form');
const status = document.querySelector('#status');
const search = document.querySelector('#search');
const cancel = document.querySelector('#cancel');
const save = document.querySelector('#save');
const fields = ['name','slug','municipality','province'];
let barangays = [];

function isAdmin() { return session?.access_token && session?.profile && String(session.profile.role).toLowerCase() === 'super_admin'; }
function show(message, error=false) { status.textContent=message; status.dataset.state=error?'error':'ok'; }
function headers(extra={}) { return { apikey: SUPABASE_CONFIG.publishableKey, Authorization:`Bearer ${session.access_token}`, 'Content-Type':'application/json', ...extra }; }

if (!isAdmin()) window.location.replace('login.html');
else { welcome.textContent=`Signed in as ${session.profile.full_name || session.user.email}`; loadBarangays(); }

async function loadBarangays() {
  try { const r=await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays?select=id,name,slug,municipality,province,status,created_at&order=name.asc`,{headers:headers()}); if(!r.ok) throw new Error('Unable to load barangays.'); barangays=await r.json(); render(); }
  catch(e){show(e.message||'Unable to load barangays.',true);}
}
function render(){const q=search.value.trim().toLowerCase();const rows=barangays.filter(b=>[b.name,b.slug,b.municipality,b.province].some(v=>String(v||'').toLowerCase().includes(q)));list.innerHTML=rows.length?rows.map(b=>`<article style="padding:14px 0;border-bottom:1px solid #e2e8f0"><strong>${escapeHtml(b.name)}</strong><div class="muted">${escapeHtml(b.municipality||'')} ${escapeHtml(b.province||'')} · ${escapeHtml(b.status)}</div><button data-edit="${b.id}" type="button">Edit</button> <button data-toggle="${b.id}" type="button">${b.status==='active'?'Deactivate':'Activate'}</button></article>`).join(''):'No barangays found.';}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function resetForm(){form.reset();document.querySelector('#barangay-id').value='';save.textContent='Add Barangay';cancel.hidden=true;}
form.addEventListener('submit',async e=>{e.preventDefault();const id=document.querySelector('#barangay-id').value;const body=Object.fromEntries(fields.map(f=>[f,document.querySelector('#'+f).value.trim()]));if(!body.slug.match(/^[a-z0-9-]+$/)){show('Slug must use lowercase letters, numbers, and hyphens.',true);return;}try{const r=await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays${id?`?id=eq.${encodeURIComponent(id)}`:''}`,{method:id?'PATCH':'POST',headers:headers({'Prefer':'return=minimal'}),body:JSON.stringify(body)});if(!r.ok)throw new Error('Save failed. Check the slug or your permissions.');show(id?'Barangay updated.':'Barangay added.');resetForm();await loadBarangays();}catch(e){show(e.message||'Save failed.',true);}});
list.addEventListener('click',async e=>{const edit=e.target.closest('[data-edit]');const toggle=e.target.closest('[data-toggle]');if(edit){const b=barangays.find(x=>x.id===edit.dataset.edit);if(!b)return;fields.forEach(f=>document.querySelector('#'+f).value=b[f]||'');document.querySelector('#barangay-id').value=b.id;save.textContent='Save Changes';cancel.hidden=false;window.scrollTo({top:0,behavior:'smooth'});}if(toggle){const b=barangays.find(x=>x.id===toggle.dataset.toggle);if(!b)return;try{const r=await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays?id=eq.${encodeURIComponent(b.id)}`,{method:'PATCH',headers:headers({'Prefer':'return=minimal'}),body:JSON.stringify({status:b.status==='active'?'inactive':'active'})});if(!r.ok)throw new Error('Status update failed.');show(`Barangay ${b.status==='active'?'deactivated':'activated'}.`);await loadBarangays();}catch(e){show(e.message||'Status update failed.',true);}}});
search.addEventListener('input',render);cancel.addEventListener('click',resetForm);document.querySelector('#logout').addEventListener('click',()=>{sessionStorage.removeItem('brgywebsaas_session');window.location.replace('login.html');});
