import { SUPABASE_CONFIG } from './config.js';
const session=JSON.parse(sessionStorage.getItem('brgywebsaas_session')||'null');
const role=String(session?.profile?.role||'').toLowerCase();
const contextId=session?.dashboard_context?.barangay_id||session?.profile?.barangay_id||null;
const canAccessSharedDashboard=session?.access_token&&session?.profile?.approval_status==='approved'&&((role==='barangay_admin'&&session?.profile?.barangay_id===contextId)||(role==='super_admin'&&session?.dashboard_context?.source==='barangay-login'&&contextId));
if(!canAccessSharedDashboard){sessionStorage.removeItem('brgywebsaas_session');window.location.replace(role==='super_admin'?'superadmin-login.html':'login.html');throw new Error('Unauthorized');}
const welcome=document.querySelector('#welcome'),barangayName=document.querySelector('#barangay-name'),workspaceTitle=document.querySelector('#workspace-title'),assigned=document.querySelector('#assigned'),accessLabel=document.querySelector('#access-label');
welcome.textContent=`Signed in as ${session.profile.full_name||session.user?.email||(role==='super_admin'?'Super Admin':'Barangay Admin')}`;
async function load(){try{const r=await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays?id=eq.${encodeURIComponent(contextId)}&select=id,name,municipality,province,status&limit=1`,{headers:{apikey:SUPABASE_CONFIG.publishableKey,Authorization:`Bearer ${session.access_token}`}});if(!r.ok)throw new Error();const rows=await r.json(),b=rows[0];if(!b||b.status!=='active'){assigned.textContent='Assigned barangay is inactive or unavailable';return}barangayName.textContent=b.name;workspaceTitle.textContent=`${b.name} Barangay workspace`;accessLabel.textContent=`${b.name} Admin`;assigned.textContent=[b.municipality,b.province].filter(Boolean).join(' · ')||'Assigned barangay';}catch{assigned.textContent='Unable to load barangay assignment';}}
load();
document.querySelector('#logout').addEventListener('click',()=>{sessionStorage.removeItem('brgywebsaas_session');window.location.replace(role==='super_admin'?'superadmin-login.html':'login.html')});
