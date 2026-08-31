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
    subtitle.textContent = 'Select a barangay-specific admin login link. This page cannot sign in without a barangay assignment.';
    formWrap.hidden = true;
    show('Missing barangay login link. Open Admin Login from the Super Admin Barangays page.', true);
    return;
  }

  try {
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/barangays?slug=eq.${encodeURIComponent(slug)}&status=eq.active&select=id,name,slug,municipality,province&limit=1`,
      { headers: { apikey: SUPABASE_CONFIG.publishableKey } }
    );
    if (!response.ok) throw new Error('Unable to load barangay.');

    const rows = await response.json();
    targetBarangay = rows[0];
    if (!targetBarangay) {
      title.textContent = 'Barangay unavailable';
      subtitle.textContent = 'This barangay login is inactive or does not exist.';
      formWrap.hidden = true;
      return;
    }

    title.textContent = `${targetBarangay.name} — Barangay Admin Sign in`;
    subtitle.textContent = `Authorized Barangay Admin accounts for ${targetBarangay.name}. Super Admin may also sign in here and will be sent to the Super Admin dashboard.`;
    if (signup) signup.href = `barangay-signup.html?barangay=${encodeURIComponent(targetBarangay.slug)}`;
  } catch (error) {
    formWrap.hidden = true;
    show(error instanceof Error ? error.message : 'Unable to load barangay.', true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;

  if (!targetBarangay) {
    show('Barangay assignment is required before login.', true);
    return;
  }
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

    const profileResponse = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/profiles?id=eq.${encodeURIComponent(data.user.id)}&select=id,full_name,email,role,barangay_id,approval_status&limit=1`,
      { headers: { apikey: SUPABASE_CONFIG.publishableKey, Authorization: `Bearer ${data.access_token}` } }
    );
    if (!profileResponse.ok) throw new Error('Unable to verify your profile.');

    const profiles = await profileResponse.json();
    const profile = profiles[0];
    if (!profile) throw new Error('No admin profile is assigned to this account.');

    const role = String(profile.role || '').toLowerCase();

    // The single Super Admin is global: a Super Admin may enter from any
    // barangay admin login URL and is routed to the Super Admin dashboard.
    if (role === 'super_admin') {
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
