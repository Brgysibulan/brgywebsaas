import { SUPABASE_CONFIG } from './config.js';
const session=JSON.parse(sessionStorage.getItem('brgywebsaas_session')||'null');
const role=String(session?.profile?.role||'').toLowerCase();
if(!session?.access_token||role!=='barangay_admin'||session?.profile?.approval_status!=='approved'||!session?.profile?.barangay_id){sessionStorage.removeItem('brgywebsaas_session');window.location.replace('login.html');throw new Error('Unauthorized');}
const welcome=document.querySelector('#welcome'),barangayName=document.querySelector('#barangay-name'),assigned=document.querySelector('#assigned');
welcome.textContent=`Signed in as ${session.profile.full_name||session.user?.email||'Barangay Admin'}`;
async function load(){try{const r=await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays?id=eq.${encodeURIComponent(session.profile.barangay_id)}&select=id,name,municipality,province,status&limit=1`,{headers:{apikey:SUPABASE_CONFIG.publishableKey,Authorization:`Bearer ${session.access_token}`}});if(!r.ok)throw new Error();const rows=await r.json(),b=rows[0];if(!b||b.status!=='active'){assigned.textContent='Assigned barangay is inactive or unavailable';return}barangayName.textContent=b.name;assigned.textContent=[b.municipality,b.province].filter(Boolean).join(' · ')||'Assigned barangay';}catch{assigned.textContent='Unable to load barangay assignment';}}
load();
document.querySelector('#logout').addEventListener('click',()=>{sessionStorage.removeItem('brgywebsaas_session');window.location.replace('login.html')});
