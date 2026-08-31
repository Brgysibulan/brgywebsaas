function installManageButtons(){
  document.querySelectorAll('#barangays article').forEach(article=>{
    const actions=article.querySelector('.barangay-actions');
    if(!actions || actions.querySelector('[data-manage-admin]')) return;
    const name=article.querySelector('strong')?.textContent?.trim();
    if(!name) return;
    const button=document.createElement('button');
    button.type='button';
    button.className='btn btn-sm btn-outline-primary';
    button.dataset.manageAdmin='true';
    button.dataset.barangayName=name;
    button.textContent='Manage Admin';
    actions.insertBefore(button,actions.firstChild);
  });
}
function openManageAdmin(button){
  const select=document.querySelector('#admin-manager-barangay');
  if(!select) return;
  const wanted=(button.dataset.barangayName||'').trim().toLowerCase();
  const option=[...select.options].find(o=>o.textContent.trim().toLowerCase()===wanted);
  if(!option) return;
  select.value=option.value;
  select.dispatchEvent(new Event('change',{bubbles:true}));
  document.querySelectorAll('.app-section').forEach(s=>s.hidden=s.id!=='admins-section');
  document.querySelectorAll('.super-nav button[data-section]').forEach(x=>x.classList.toggle('active',x.dataset.section==='barangays'));
  document.querySelector('#admins-section')?.scrollIntoView({behavior:'smooth',block:'start'});
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-manage-admin]');
  if(!button) return;
  event.preventDefault();
  openManageAdmin(button);
});
new MutationObserver(installManageButtons).observe(document.body,{childList:true,subtree:true});
installManageButtons();