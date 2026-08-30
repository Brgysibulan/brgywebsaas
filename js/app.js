import { SUPABASE_CONFIG } from './config.js';

const status = document.querySelector('#app-status');

function setStatus(message, error = false) {
  status.textContent = message;
  status.dataset.state = error ? 'error' : 'ok';
}

if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('YOUR_PROJECT') || !SUPABASE_CONFIG.publishableKey || SUPABASE_CONFIG.publishableKey.includes('YOUR_')) {
  setStatus('Supabase configuration is not connected yet.', true);
} else {
  setStatus('Frontend ready for Supabase authentication.');
}
