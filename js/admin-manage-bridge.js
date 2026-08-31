function installManageButtons(){
  document.querySelectorAll('#barangays article').forEach(article=>{
    const actions=article.querySelector('.barangay-actions');
    if(!actions || actions.querySelector('[data-manage-admin]')) return;
    const name=article.querySelector('strong')?.textContent?.trim();
    if(!name) return;
    const idSource=actions.querySelector('[data-domain],[data-edit],[data-toggle],[data-delete]');
    const barangayId=idSource?.dataset.domain||idSource?.dataset.edit||idSource?.dataset.toggle||idSource?.dataset.delete||'';
    const button=document.createElement('button');
    button.type='button';
    button.className='btn btn-sm btn-outline-primary';
    button.dataset.manageAdmin='true';
    button.dataset.barangayId=barangayId;
    button.dataset.barangayName=name;
    button.textContent='Manage Admin';
    actions.insertBefore(button,actions.firstChild);
  });
}

function showAdminSection(){
  document.querySelectorAll('.app-section').forEach(section=>{
    section.hidden=section.id!=='admins-section';
  });
  document.querySelectorAll('[data-section]').forEach(control=>{
    control.classList.toggle('active',control.dataset.section==='admins');
  });
  document.querySelector('#admins-section')?.scrollIntoView({behavior:'smooth',block:'start'});
}

function selectBarangayById(id){
  const select=document.querySelector('#admin-manager-barangay');
  if(!select||!id) return false;
  const option=[...select.options].find(o=>o.value===id);
  if(!option) return false;
  select.value=option.value;
  select.dispatchEvent(new Event('change',{bubbles:true}));
  return true;
}

function selectBarangayByName(name){
  const select=document.querySelector('#admin-manager-barangay');
  if(!select) return false;
  const wanted=String(name||'').trim().toLowerCase();
  const option=[...select.options].find(o=>o.value && o.textContent.trim().toLowerCase()===wanted);
  if(!option) return false;
  select.value=option.value;
  select.dispatchEvent(new Event('change',{bubbles:true}));
  return true;
}

function openManageAdmin(button){
  const id=button.dataset.barangayId||'';
  const name=button.dataset.barangayName||'';
  showAdminSection();
  if(selectBarangayById(id)) return;

  let attempts=0;
  const retry=()=>{
    if(selectBarangayById(id)||selectBarangayByName(name)) return;
    attempts+=1;
    if(attempts<20) setTimeout(retry,100);
  };
  retry();
}

document.addEventListener('click',event=>{
  const button=event.target.closest('[data-manage-admin]');
  if(!button) return;
  event.preventDefault();
  openManageAdmin(button);
});

new MutationObserver(installManageButtons).observe(document.body,{childList:true,subtree:true});
installManageButtons();
