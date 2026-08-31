import { SUPABASE_CONFIG } from './config.js';

const params = new URLSearchParams(location.search);
const slug = (params.get('barangay') || '').trim().toLowerCase();
const form = document.querySelector('#login-form');
const formWrap = document.querySelector('#login-form-wrap');
const status = document.querySelector('#login-status');
const button = document.querySelector('#login-button');
const title = document.querySelector('#barangay-title');
const subtitle = document.querySelector('#barangay-subtitle');
const signup = document.querySelector('#signup-link');
let targetBarangay = null;

function show(message, error = false) {
  status.hidden = false;
  status.textContent = message;
  status.dataset.state = error ? 'error' : 'ok';
}

async function loadBarangay() {
  if (!slug) {
    title.textContent = 'Barangay Admin Sign in';
    subtitle.textContent = 'Barangay Admin accounts must use their assigned barangay login link. The authorized Super Admin account may also sign in here.';
    return;
  }

  try {
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/barangays?slug=eq.${encodeURIComponent(slug)}&status=eq.active&select=id,name,slug,municipality,province&limit=1`,
      { headers: { apikey: SUPABASE_CONFIG.publishableKey } }
    );
    if (!response.ok) throw new Error('Unable to load barangay.');

    const rows = await response.json();
    targetBarangay = rows[0] || null;
    if (!targetBarangay) {
      title.textContent = 'Barangay unavailable';
      subtitle.textContent = 'This barangay login is inactive or does not exist. The authorized Super Admin may still use this login page.';
      if (signup) signup.hidden = true;
      return;
    }

    title.textContent = `${targetBarangay.name} — Barangay Admin Sign in`;
    subtitle.textContent = `Authorized Barangay Admin accounts for ${targetBarangay.name}. The authorized Super Admin account may also sign in here and will be sent to the Super Admin dashboard.`;
    if (signup) signup.href = `barangay-signup.html?barangay=${encodeURIComponent(targetBarangay.slug)}`;
  } catch (error) {
    show(error instanceof Error ? error.message : 'Unable to load barangay.', true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;

  if (!email || !password) {
    show('Enter your email and password.', true);
    return;
  }

  button.disabled = true;
  show('Signing in…');

  try {
    const response = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: SUPABASE_CONFIG.publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || data.msg || 'Invalid credentials.');
    if (!data.user?.id || !data.access_token) throw new Error('Authentication response is incomplete.');

    const profileResponse = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/profiles?id=eq.${encodeURIComponent(data.user.id)}&select=id,full_name,email,role,barangay_id,approval_status&limit=1`,
      { headers: { apikey: SUPABASE_CONFIG.publishableKey, Authorization: `Bearer ${data.access_token}` } }
    );
    if (!profileResponse.ok) {
      const details = await profileResponse.text().catch(() => '');
      throw new Error(details || 'Unable to verify your profile.');
    }

    const profiles = await profileResponse.json();
    const profile = profiles[0];
    if (!profile) throw new Error('No admin profile is assigned to this account.');

    const role = String(profile.role || '').toLowerCase();

    // Super Admin is global and is never constrained by the barangay URL.
    if (role === 'super_admin') {
      if (profile.barangay_id !== null) throw new Error('Super Admin profile has an invalid barangay assignment.');
      if (profile.approval_status !== 'approved') throw new Error('Your Super Admin account is not approved.');

      sessionStorage.setItem('brgywebsaas_session', JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
        profile
      }));

      show('Super Admin verified. Opening Super Admin dashboard…');
      location.href = 'superadmin.html';
      return;
    }

    if (role !== 'barangay_admin') throw new Error('This login is for Barangay Admin accounts only.');
    if (!targetBarangay) throw new Error('Open the Barangay Admin login link for your assigned barangay.');
    if (profile.barangay_id !== targetBarangay.id) throw new Error(`This account is not assigned to ${targetBarangay.name}.`);
    if (profile.approval_status !== 'approved') {
      if (profile.approval_status === 'rejected') throw new Error('Your account was rejected by the Super Admin.');
      throw new Error('Your account is pending Super Admin approval.');
    }

    sessionStorage.setItem('brgywebsaas_session', JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
      profile
    }));

    show(`Signed in to ${targetBarangay.name}. Opening your dashboard…`);
    location.href = 'admin.html';
  } catch (error) {
    show(error instanceof Error ? error.message : 'Sign in failed.', true);
    button.disabled = false;
  }
});

loadBarangay();
