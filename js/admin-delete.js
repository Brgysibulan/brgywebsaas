import { SUPABASE_CONFIG } from './config.js';

const session = JSON.parse(sessionStorage.getItem('brgywebsaas_session') || 'null');
const isSuperAdmin = session?.access_token && String(session?.profile?.role || '').toLowerCase() === 'super_admin' && session?.profile?.approval_status === 'approved';
if (!isSuperAdmin) throw new Error('Unauthorized');

function addDeleteButtons() {
  document.querySelectorAll('#slot-list .admin-slot').forEach(slot => {
    const edit = slot.querySelector('[data-edit-admin]');
    const actions = slot.querySelector('.slot-actions');
    if (!edit || !actions || actions.querySelector('[data-delete-admin]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-sm btn-outline-danger';
    button.dataset.deleteAdmin = edit.dataset.editAdmin;
    button.textContent = 'Delete';
    actions.appendChild(button);
  });
}

function setStatus(text, error = false) {
  const status = document.querySelector('#admin-status');
  if (!status) return;
  status.hidden = false;
  status.dataset.state = error ? 'error' : 'ok';
  status.textContent = text;
}

async function deleteAdmin(id, button) {
  if (!id) return;
  const slot = button.closest('.admin-slot');
  const name = slot?.querySelector('.mt-2 strong')?.textContent?.trim() || 'this admin';
  if (!window.confirm(`Delete ${name}?`)) return;

  button.disabled = true;
  button.textContent = 'Deleting…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${SUPABASE_CONFIG.url}/functions/v1/delete-barangay-admin`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_CONFIG.publishableKey,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ target_admin_id: id }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || data?.error || `Delete failed (${response.status}).`);

    slot?.remove();
    setStatus(`${name} deleted.`);
    const manager = document.querySelector('#admin-manager-barangay');
    if (manager?.value) manager.dispatchEvent(new Event('change'));
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'Delete timed out. Please try again.' : (error instanceof Error ? error.message : 'Delete failed.');
    button.disabled = false;
    button.textContent = 'Delete';
    setStatus(message, true);
  } finally {
    clearTimeout(timeout);
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-delete-admin]');
  if (button) deleteAdmin(button.dataset.deleteAdmin, button);
});

const observer = new MutationObserver(addDeleteButtons);
observer.observe(document.body, { childList: true, subtree: true });
addDeleteButtons();
