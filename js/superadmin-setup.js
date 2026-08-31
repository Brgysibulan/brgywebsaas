import { SUPABASE_CONFIG } from './config.js';

const form = document.querySelector('#setup-form');
const button = document.querySelector('#setup-button');
const status = document.querySelector('#setup-status');

function show(message, error = false) {
  status.textContent = message;
  status.dataset.state = error ? 'error' : 'ok';
}

async function request(path, options = {}, accessToken = null) {
  const response = await fetch(`${SUPABASE_CONFIG.url}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_CONFIG.publishableKey,
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.error_description || data.message || data.hint || 'Request failed.');
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
  const data = await request('/rest/v1/rpc/super_admin_setup_available', {
    method: 'POST',
    body: '{}'
  });
  return data === false;
}

async function signIn(email, password) {
  return request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
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
    let authData;
    try {
      authData = await request('/auth/v1/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, data: { full_name: fullName } })
      });
    } catch (signupError) {
      if (/already registered|already exists|user already/i.test(signupError.message)) {
        show('Account exists. Signing in to finish Super Admin setup…');
        authData = await signIn(email, password);
      } else {
        throw signupError;
      }
    }

    if (!authData.access_token) {
      show('Account created. Check your email, confirm the address, then submit this form again to finish setup.');
      return;
    }

    const user = authData.user;
    if (!user?.id) throw new Error('Supabase did not return a user ID.');

    show('Creating Super Admin profile…');
    await bootstrapProfile(authData.access_token, user.id, fullName);

    sessionStorage.setItem('brgywebsaas_session', JSON.stringify({
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      user,
      profile: { id: user.id, full_name: fullName, role: 'super_admin', barangay_id: null }
    }));

    show('Super Admin setup complete. Redirecting…');
    window.location.href = 'superadmin.html';
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Setup failed.';
    if (/already|duplicate|unique|configured/i.test(message)) {
      show('Super Admin setup is already completed. A second Super Admin is not allowed.', true);
    } else {
      show(message, true);
    }
  } finally {
    button.disabled = false;
  }
});
