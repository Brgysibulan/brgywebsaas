import {SUPABASE_CONFIG} from './config.js';
const session=JSON.parse(sessionStorage.getItem('brgywebsaas_session')||'null');
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function set(id,value){const el=$(id);if(el)el.textContent=value}
function status(ok){const el=$('#supabase-health-status');if(!el)return;el.textContent=ok?'Operational':'Attention needed';el.dataset.state=ok?'ok':'error'}
async function check(){
 const started=performance.now();
 set('#supabase-health-status','Checking…');set('#supabase-health-api','Checking…');set('#supabase-health-db','Checking…');set('#supabase-health-latency','—');set('#supabase-health-checked','—');
 if(!SUPABASE_CONFIG.url||!SUPABASE_CONFIG.publishableKey){status(false);set('#supabase-health-api','Not configured');set('#supabase-health-db','Not available');return}
 try{
  const headers={apikey:SUPABASE_CONFIG.publishableKey,Authorization:`Bearer ${session?.access_token||SUPABASE_CONFIG.publishableKey}`};
  const r=await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays?select=id&limit=1`,{headers,cache:'no-store'});
  const ms=Math.round(performance.now()-started);set('#supabase-health-latency',`${ms} ms`);set('#supabase-health-checked',new Date().toLocaleString());
  if(!r.ok)throw Error(`HTTP ${r.status}`);
  await r.json();set('#supabase-health-api','Reachable');set('#supabase-health-db','Query successful');status(true);
 }catch(e){const ms=Math.round(performance.now()-started);set('#supabase-health-latency',`${ms} ms`);set('#supabase-health-checked',new Date().toLocaleString());set('#supabase-health-api','Unavailable');set('#supabase-health-db',e.message||'Query failed');status(false)}
}
$('#supabase-health-refresh')?.addEventListener('click',check);check();
