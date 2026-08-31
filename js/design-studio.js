import { SUPABASE_CONFIG } from './config.js';

const session = JSON.parse(sessionStorage.getItem('brgywebsaas_session') || 'null');
const profile = session?.profile;
const status = document.querySelector('#status');
const ids = ['theme','primary','accent','navbar','footer','button'];
const preview = document.querySelector('#preview');

function show(message, error=false){status.hidden=false;status.textContent=message;status.className=`alert ${error?'alert-danger':'alert-success'}`;}
function headers(){return {apikey:SUPABASE_CONFIG.publishableKey,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'};}
function applyPreview(){preview.style.setProperty('--studio-primary',document.querySelector('#primary').value);preview.style.setProperty('--studio-accent',document.querySelector('#accent').value);}
async function load(){
 if(!session || profile?.role!=='barangay_admin' || !profile.barangay_id){show('Only an approved Barangay Admin can access this studio.',true); ids.forEach(id=>document.querySelector('#'+id).disabled=true);return;}
 try{const r=await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangay_design_settings?barangay_id=eq.${encodeURIComponent(profile.barangay_id)}&select=*&limit=1`,{headers:headers()});if(!r.ok)throw Error('Unable to load design settings.');const rows=await r.json();const s=rows[0];if(s){const x=s.settings||{};for(const id of ids)if(x[id]!==undefined)document.querySelector('#'+id).value=x[id];}applyPreview();}
 catch(e){show(e.message,true)}
}
async function save(publish){
 if(!session?.access_token)return;
 const settings={};for(const id of ids)settings[id]=document.querySelector('#'+id).value;
 settings.logo_url=null;settings.sections={hero:true,about:true,services:true,announcements:true,officials:true,contact:true};
 const body={barangay_id:profile.barangay_id,settings,is_published:publish};
 try{const r=await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangay_design_settings?on_conflict=barangay_id`,{method:'POST',headers:{...headers(),Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(body)});if(!r.ok)throw Error('Unable to save design.');show(publish?'Design published.':'Draft saved.');}
 catch(e){show(e.message,true)}
}
ids.forEach(id=>document.querySelector('#'+id).addEventListener('input',applyPreview));document.querySelector('#save').addEventListener('click',()=>save(false));document.querySelector('#publish').addEventListener('click',()=>save(true));load();