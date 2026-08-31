import { SUPABASE_CONFIG } from './config.js';

const form = document.querySelector('#setup-form');
const button = document.querySelector('#setup-button');
const status = document.querySelector('#setup-status');

function show(message, error = false) {
  status.textContent = message;
  status.dataset.state = error ? 'error' : 'ok';
}

async function request(path, options = {}) {
  const response = await fetch(`${SUPABASE_CONFIG.url}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_CONFIG.publishableKey,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.error_description || data.message || 'Request failed.');
  return data;
}

async function bootstrapProfile(accessToken, userId, fullName) {
  const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_CONFIG.publishableKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ id: userId, full_name: fullName, role: 'super_admin', barangay_id: null })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || data.hint || 'Could not create the Super Admin profile.');
  }
}

async function isAlreadyConfigured() {
  const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/profiles?role=eq.super_admin&select=id&limit=1`, {
    headers: { apikey: SUPABASE_CONFIG.publishableKey }
  });
  if (!response.ok) throw new Error('Unable to check Super Admin setup status.');
  const rows = await response.json();
  return rows.length > 0;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.publishableKey) {
    show('Supabase is not configured.', true);
    return;
  }

  const fullName = document.querySelector('#full-name').value.trim();
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  const confirmPassword = document.querySelector('#confirm-password').value;

  if (password !== confirmPassword) {
    show('Passwords do not match.', true);
    return;
  }

  button.disabled = true;
  show('Checking setup status…');

  try {
    if (await isAlreadyConfigured()) {
      show('Super Admin is already configured. No second account can be created.', true);
      return;
    }

    show('Creating your account…');
    const signup = await request('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, data: { full_name: fullName } })
    });

    let accessToken = signup.access_token;
    let user = signup.user;

    if (!accessToken) {
      show('Account created. Check your email, confirm the address, then return here and submit the same credentials to finish setup.');
      return;
    }

    if (!user) user = signup.user;
    show('Creating Super Admin profile…');
    await bootstrapProfile(accessToken, user.id, fullName);

    sessionStorage.setItem('brgywebsaas_session', JSON.stringify({
      access_token: accessToken,
      refresh_token: signup.refresh_token,
      user,
      profile: { id: user.id, full_name: fullName, role: 'super_admin', barangay_id: null }
    }));

    show('Super Admin setup complete. Redirecting…');
    window.location.href = 'superadmin.html';
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Setup failed.';
    if (/already|duplicate|unique/i.test(message)) {
      show('Super Admin setup is already completed. A second Super Admin is not allowed.', true);
    } else {
      show(message, true);
    }
  } finally {
    button.disabled = false;
  }
});
