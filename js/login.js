import { SUPABASE_CONFIG } from './config.js';

const form = document.querySelector('#login-form');
const status = document.querySelector('#login-status');

function show(message, error = false) {
  status.textContent = message;
  status.dataset.state = error ? 'error' : 'ok';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('YOUR_PROJECT') || !SUPABASE_CONFIG.publishableKey || SUPABASE_CONFIG.publishableKey.includes('YOUR_')) {
    show('Supabase is not configured yet.', true);
    return;
  }

  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  show('Signing in…');

  try {
    const response = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: SUPABASE_CONFIG.publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || data.msg || 'Invalid credentials.');

    const profileResponse = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/profiles?id=eq.${encodeURIComponent(data.user.id)}&select=id,full_name,role,barangay_id&limit=1`, {
      headers: { apikey: SUPABASE_CONFIG.publishableKey, Authorization: `Bearer ${data.access_token}` }
    });
    if (!profileResponse.ok) throw new Error('Unable to verify your profile.');
    const profiles = await profileResponse.json();
    const profile = profiles[0];
    if (!profile || String(profile.role).toLowerCase() !== 'super_admin') {
      show('Access denied: Super Admin role required.', true);
      return;
    }

    sessionStorage.setItem('brgywebsaas_session', JSON.stringify({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user, profile }));
    window.location.href = 'superadmin.html';
  } catch (error) {
    show(error instanceof Error ? error.message : 'Sign in failed.', true);
  }
});
