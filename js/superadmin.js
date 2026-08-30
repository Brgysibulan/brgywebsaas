import { SUPABASE_CONFIG } from './config.js';

const session = JSON.parse(sessionStorage.getItem('brgywebsaas_session') || 'null');
const welcome = document.querySelector('#welcome');
const list = document.querySelector('#barangays');

if (!session?.access_token || !session?.profile || !['super_admin', 'superadmin'].includes(String(session.profile.role).toLowerCase())) {
  window.location.replace('login.html');
} else {
  welcome.textContent = `Signed in as ${session.profile.full_name || session.user.email}`;
  loadBarangays();
}

async function loadBarangays() {
  try {
    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays?select=id,name,slug,municipality,province,status,created_at&order=name.asc`, {
      headers: { apikey: SUPABASE_CONFIG.publishableKey, Authorization: `Bearer ${session.access_token}` }
    });
    if (!response.ok) throw new Error('Unable to load barangays.');
    const barangays = await response.json();
    list.textContent = barangays.length ? barangays.map(b => `${b.name} (${b.status})`).join(' • ') : 'No barangays yet.';
  } catch (error) {
    list.textContent = error instanceof Error ? error.message : 'Unable to load barangays.';
  }
}

document.querySelector('#logout').addEventListener('click', () => {
  sessionStorage.removeItem('brgywebsaas_session');
  window.location.replace('login.html');
});
