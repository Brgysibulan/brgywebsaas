import { SUPABASE_CONFIG } from './config.js';

const params = new URLSearchParams(location.search);
const slug = (params.get('barangay') || '').trim().toLowerCase();
const form = document.querySelector('#login-form');
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
    subtitle.textContent = 'Authorized Barangay Admin accounts may sign in here. The authorized Super Admin account may also use this page and open the selected Barangay dashboard.';
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
      subtitle.textContent = 'This barangay login is inactive or does not exist.';
      if (signup) signup.hidden = true;
      return;
    }

    title.textContent = `${targetBarangay.name} — Barangay Admin Sign in`;
    subtitle.textContent = `Barangay dashboard for ${targetBarangay.name}. The two assigned Barangay Admin accounts and the authorized Super Admin account can access this dashboard.`;
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
    if (profile.approval_status !== 'approved') throw new Error('Your account is not approved.');

    // Super Admin is global. When signing in through a Barangay login URL,
    // keep the real role unchanged but attach a temporary dashboard context.
    // This lets the Super Admin inspect that Barangay's shared dashboard without
    // converting the account into a Barangay Admin or changing its profile.
    if (role === 'super_admin') {
      if (profile.barangay_id !== null) throw new Error('Super Admin profile has an invalid barangay assignment.');

      sessionStorage.setItem('brgywebsaas_session', JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
        profile,
        dashboard_context: targetBarangay ? { barangay_id: targetBarangay.id, barangay_name: targetBarangay.name, source: 'barangay-login' } : null
      }));

      if (targetBarangay) {
        show(`Super Admin verified. Opening ${targetBarangay.name} dashboard…`);
        location.href = 'admin.html';
      } else {
        show('Super Admin verified. Opening Super Admin dashboard…');
        location.href = 'superadmin.html';
      }
      return;
    }

    if (role !== 'barangay_admin') throw new Error('This login is for Barangay Admin accounts only.');
    if (!targetBarangay) throw new Error('Open the Barangay Admin login link for your assigned barangay.');
    if (profile.barangay_id !== targetBarangay.id) throw new Error(`This account is not assigned to ${targetBarangay.name}.`);

    sessionStorage.setItem('brgywebsaas_session', JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
      profile,
      dashboard_context: { barangay_id: targetBarangay.id, barangay_name: targetBarangay.name, source: 'barangay-login' }
    }));

    show(`Signed in to ${targetBarangay.name}. Opening your dashboard…`);
    location.href = 'admin.html';
  } catch (error) {
    show(error instanceof Error ? error.message : 'Sign in failed.', true);
    button.disabled = false;
  }
});

loadBarangay();
