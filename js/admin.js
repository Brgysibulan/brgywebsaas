import { SUPABASE_CONFIG } from './config.js';
const session=JSON.parse(sessionStorage.getItem('brgywebsaas_session')||'null');
const role=String(session?.profile?.role||'').toLowerCase();
if(!session?.access_token||role!=='barangay_admin'){window.location.replace('login.html');throw new Error('Unauthorized');}
const welcome=document.querySelector('#welcome');
const barangayName=document.querySelector('#barangay-name');
const assigned=document.querySelector('#assigned');
welcome.textContent=`Signed in as ${session.profile.full_name||session.user?.email||'Barangay Admin'}`;
async function load(){try{const r=await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays?id=eq.${encodeURIComponent(session.profile.barangay_id||'')}&select=name,municipality,province&limit=1`,{headers:{apikey:SUPABASE_CONFIG.publishableKey,Authorization:`Bearer ${session.access_token}`}});if(!r.ok)throw new Error();const rows=await r.json();const b=rows[0];if(!b){assigned.textContent='No barangay assignment found';return}barangayName.textContent=b.name;assigned.textContent=[b.municipality,b.province].filter(Boolean).join(' · ')||'Assigned barangay';}catch{assigned.textContent='Unable to load barangay assignment';}}
load();
document.querySelector('#logout').addEventListener('click',()=>{sessionStorage.removeItem('brgywebsaas_session');window.location.replace('login.html')});
