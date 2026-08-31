import { SUPABASE_CONFIG } from './config.js';

const params = new URLSearchParams(location.search);
const barangayId = params.get('id');
const name = document.querySelector('#barangay-name');
const locationText = document.querySelector('#barangay-location');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
}

async function load() {
  if (!barangayId) { name.textContent = 'Barangay page'; return; }
  try {
    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays?id=eq.${encodeURIComponent(barangayId)}&status=eq.active&select=name,municipality,province&limit=1`, { headers: { apikey: SUPABASE_CONFIG.publishableKey } });
    if (!response.ok) throw new Error('Unable to load barangay.');
    const rows = await response.json();
    const barangay = rows[0];
    if (!barangay) throw new Error('Barangay page not found.');
    name.innerHTML = escapeHtml(barangay.name);
    locationText.textContent = [barangay.municipality, barangay.province].filter(Boolean).join(', ') || 'Official public information';
    document.title = `${barangay.name} — BRGYWEBSAAS`;
  } catch (error) {
    name.textContent = 'Barangay page unavailable';
    locationText.textContent = error.message || 'Unable to load this page.';
  }
}
load();
