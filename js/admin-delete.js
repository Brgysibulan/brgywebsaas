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

async function deleteAdmin(id, button) {
  if (!id) return;
  const slot = button.closest('.admin-slot');
  const name = slot?.querySelector('.mt-2 strong')?.textContent?.trim() || 'this admin';

  // Keep confirmation short and mobile-friendly.
  if (!window.confirm(`Delete ${name}?`)) return;

  button.disabled = true;
  button.textContent = 'Deleting…';
  try {
    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/rpc/superadmin_delete_barangay_admin`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_CONFIG.publishableKey,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ target_admin_id: id })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || data?.error || data?.hint || 'Unable to delete admin account.');

    // Remove the card immediately so the UI confirms the successful delete.
    slot?.remove();
    const status = document.querySelector('#admin-status');
    if (status) {
      status.hidden = false;
      status.dataset.state = 'ok';
      status.textContent = `${name} deleted.`;
    }

    // Refresh data without a full page reload.
    document.querySelector('#admin-manager-barangay')?.dispatchEvent(new Event('change'));
  } catch (error) {
    button.disabled = false;
    button.textContent = 'Delete';
    const status = document.querySelector('#admin-status');
    if (status) {
      status.hidden = false;
      status.dataset.state = 'error';
      status.textContent = error instanceof Error ? error.message : 'Delete failed.';
    }
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-delete-admin]');
  if (button) deleteAdmin(button.dataset.deleteAdmin, button);
});

const observer = new MutationObserver(addDeleteButtons);
observer.observe(document.body, { childList: true, subtree: true });
addDeleteButtons();
