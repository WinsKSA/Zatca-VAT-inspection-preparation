// ================================================================ storage: Google Sheets (Apps Script) or browser
// demo.html sets window.FAHS_MODE="demo" (browser only); the main app talks to the Google Sheet through the Apps Script API.
const API_URL="https://script.google.com/macros/s/AKfycbygC_bY9QKQBoLKMhXA2Yvo_vQ9Vsgdvjo30PThWUxY7YsPv-mo8Z4yNRzEAjkAbyG9Lg/exec";
const REMOTE=window.FAHS_MODE!=="demo";
const SALES_F=["date","no","type","cust","cvat","ctype","cat","net","vat","uuid","fat","gl","ev"];
const PUR_F=["date","no","sup","svat","country","cat","nature","net","vat","valid","claimed","bayan","gl"];
const SCHEMA={
 meta:{kind:"kv",get:()=>({example:S.example?"yes":"no",version:"2"}),set:o=>{S.example=o.example==="yes"}},
 setup:{kind:"kv",get:()=>S.setup,set:o=>{Object.assign(S.setup,o)}},
 case:{kind:"kv",get:()=>S.case,set:o=>{Object.assign(S.case,o)}},
 sample:{kind:"kv",get:()=>S.sample,set:o=>{Object.assign(S.sample,o)}},
 tb:{kind:"rows",headers:["code","name","fs","map","open",...Array.from({length:12},(_,i)=>"m"+(i+1))],
   get:()=>S.tb.map(r=>[r.code,r.name,r.fs,r.map,r.open,...r.m]),set:rows=>{S.tb=rows.map(a=>({code:a[0]||"",name:a[1]||"",fs:a[2]||"",map:a[3]||"",open:a[4]||"",m:Array.from({length:12},(_,i)=>a[5+i]||"")}))}},
 returns:{kind:"rows",headers:["period","filed","ref",...BOX_IDS.flatMap(b=>["b"+b+"_amount","b"+b+"_adjustment","b"+b+"_vat"]),"b14","b15","b16"],
   get:()=>S.returns.map((r,i)=>[String(i+1),r.filed,r.ref,...BOX_IDS.flatMap(b=>[r.b[b].a,r.b[b].j,r.b[b].v]),r.b14,r.b15,r.b16]),
   set:rows=>{const out=Array.from({length:12},blankReturn);rows.forEach(a=>{const i=num(a[0])-1;if(i<0||i>11)return;const t=out[i];t.filed=a[1]||"";t.ref=a[2]||"";BOX_IDS.forEach((b,k)=>{t.b[b]={a:a[3+3*k]||"",j:a[4+3*k]||"",v:a[5+3*k]||""}});const o=3+3*BOX_IDS.length;t.b14=a[o]||"";t.b15=a[o+1]||"";t.b16=a[o+2]||""});S.returns=out}},
 sales:{kind:"rows",headers:SALES_F,get:()=>S.sales.map(r=>SALES_F.map(k=>r[k]??"")),set:rows=>{S.sales=rows.map(a=>Object.fromEntries(SALES_F.map((k,i)=>[k,a[i]||""])))}},
 purchases:{kind:"rows",headers:PUR_F,get:()=>S.purchases.map(r=>PUR_F.map(k=>r[k]??"")),set:rows=>{S.purchases=rows.map(a=>Object.fromEntries(PUR_F.map((k,i)=>[k,a[i]||""])))}},
 payments:{kind:"rows",headers:["p","date","ref","amt","notes"],get:()=>S.payments.map(r=>[r.p,r.date,r.ref,r.amt,r.notes].map(v=>v??"")),set:rows=>{S.payments=rows.map(a=>({p:a[0]||"",date:a[1]||"",ref:a[2]||"",amt:a[3]||"",notes:a[4]||""}))}},
 requests:{kind:"rows",headers:["item","requested","due","status","sent","ref"],get:()=>S.requests.map(r=>[r.item,r.req,r.due,r.status,r.sent,r.ref].map(v=>v??"")),set:rows=>{S.requests=rows.map(a=>({item:a[0]||"",req:a[1]||"",due:a[2]||"",status:a[3]||"Open",sent:a[4]||"",ref:a[5]||""}))}},
 checklist:{kind:"rows",headers:["no","area","document","status","owner","ref","notes"],get:()=>S.checklist.map((x,i)=>[String(i+1),CHECKLIST[i][0],CHECKLIST[i][1],x.status,x.owner,x.ref,x.notes].map(v=>v??"")),set:rows=>{rows.forEach(a=>{const i=num(a[0])-1;if(S.checklist[i])S.checklist[i]={status:a[3]||"Not started",owner:a[4]||"",ref:a[5]||"",notes:a[6]||""}})}},
 recItems:{kind:"rows",headers:["description","amount"],get:()=>S.recItems.map(x=>[x.d,x.a].map(v=>v??"")),set:rows=>{S.recItems=rows.map(a=>({d:a[0]||"",a:a[1]||""}))}},
 decisions:{kind:"rows",headers:["test","decision","explanation"],get:()=>Object.entries(S.decisions).map(([k,v])=>[k,v.d||"",v.n||""]),set:rows=>{S.decisions={};rows.forEach(a=>{if(a[0])S.decisions[a[0]]={d:a[1]||"",n:a[2]||""}})}},
 vouch:{kind:"rows",headers:["item","status","note"],get:()=>Object.entries(S.vouch).map(([k,v])=>[k,v.s||"",v.n||""]),set:rows=>{S.vouch={};rows.forEach(a=>{if(a[0])S.vouch[a[0]]={s:a[1]||"",n:a[2]||""}})}}};
function toTableRaw(k){const s=SCHEMA[k];if(s.kind==="kv"){const o=s.get();return{headers:["key","value"],rows:Object.entries(o).map(([a,b])=>[a,String(b??"")])}}return{headers:s.headers,rows:s.get().map(r=>r.map(v=>String(v??"")))}}
function fromTableRaw(k,t){const s=SCHEMA[k];if(!t||!t.rows)return;if(s.kind==="kv"){const o={};t.rows.forEach(r=>{if(r[0])o[r[0]]=r[1]??""});s.set(o)}else s.set(t.rows)}
// ---------------------------------------------------------------- API client and session
const TOKEN_KEY=KEY+"-token";
let AUTH={token:null,user:null};
try{AUTH.token=localStorage.getItem(TOKEN_KEY)||sessionStorage.getItem(TOKEN_KEY)}catch(e){}
let lastSent={}, sync={state:!REMOTE?"local":(AUTH.token?"loading":"login"),at:null,msg:""}, sending=false, pending=false;
async function api(action,body={}){
  const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,token:AUTH.token,...body})});
  if(!res.ok)throw new Error("HTTP "+res.status);
  const j=await res.json();
  if(j&&j.error==="auth"&&action!=="login"){signedOut(L("Your session has ended. Please sign in again.","انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى."));throw new Error("auth")}
  return j;
}
function setToken(t,remember){AUTH.token=t;try{localStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(TOKEN_KEY);if(t)(remember?localStorage:sessionStorage).setItem(TOKEN_KEY,t)}catch(e){}}
function signedOut(msg){clearTimeout(saveTimer);pending=false;sending=false;setToken(null);AUTH.user=null;try{localStorage.removeItem(KEY)}catch(e){}S=exampleState();S.example=false;S.tb=[];S.sales=[];S.purchases=[];S.payments=[];S.requests=[];S.returns=Array.from({length:12},blankReturn);
  lastSent={};if(typeof USERS!=="undefined")USERS=null;cur="dash";try{localStorage.removeItem(KEY+"-view")}catch(e){}sync.state="login";sync.msg=msg||"";render()}
let canEdit=()=>!REMOTE||(AUTH.user&&AUTH.user.role!=="Viewer");
let isAdmin=()=>REMOTE&&AUTH.user&&AUTH.user.role==="Admin";
function setSync(state,msg){sync.state=state;sync.msg=msg||"";if(state==="saved")sync.at=new Date();const el=document.getElementById("sync");if(el)el.outerHTML=syncChip()}
function snapshotAll(){const o={};for(const k of Object.keys(SCHEMA))o[k]=JSON.stringify(toTable(k));return o}
function save(){if(typeof relabelActive==="function")relabelActive();
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){if(!REMOTE&&!saveWarned){saveWarned=true;toast("This data is too large to keep in the browser. It stays here until you close the page.")}}
  if(!REMOTE||!canEdit()||["loading","choose","refreshing","login","setup","otp","signup","forgot","reset","newco","pick"].includes(sync.state))return;
  clearTimeout(saveTimer);setSync("pending");saveTimer=setTimeout(pushRemote,1200);
}
async function pushRemote(){
  if(!AUTH.token||!canEdit())return;
  if(sending){pending=true;return}
  const snap=snapshotAll(), payload={};for(const k of Object.keys(snap))if(snap[k]!==lastSent[k])payload[k]=JSON.parse(snap[k]);
  if(!Object.keys(payload).length){setSync("saved");return}
  sending=true;setSync("saving");
  try{const r=await api("save",{payload});sending=false;
    if(!r.ok){setSync("error",r.error==="forbidden"?L("Your role can view but not edit.","صلاحيتك للعرض فقط دون التعديل."):(r.message||r.error));return}
    Object.assign(lastSent,Object.fromEntries(Object.keys(payload).map(k=>[k,snap[k]])));setSync("saved");if(pending){pending=false;pushRemote()}}
  catch(e){sending=false;if(e.message!=="auth")setSync("error",e.message)}
}
async function loadRemote(){
  const t0=Date.now();
  try{const res=await api("load");if(!res.ok){sync.state="error";sync.msg=res.message||res.error;render();return}
    console.info("Fahs: Google Sheet loaded in "+(Date.now()-t0)+" ms (server "+(res.ms||"?")+" ms)");
    sync.sheetUrl=res.sheetUrl;AUTH.user=res.user;
    if(res.empty){sync.state="choose";render();return}
    S=exampleState();S.example=false;S.tb=[];S.sales=[];S.purchases=[];S.payments=[];S.requests=[];S.decisions={};S.vouch={};
    window.__yearRows=null;pendingYears=null;for(const k of Object.keys(SCHEMA))if(res.data[k])fromTable(k,res.data[k]);finishYears(S.year);
    S=migrate(S);lastSent=snapshotAll();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}setSync("saved");render();
  }catch(e){if(e.message!=="auth"){sync.state="error";sync.msg=e.message;render()}}
}
function startRemote(withExample){S=exampleState();if(!withExample){S.example=false;S.tb=[];S.sales=[];S.purchases=[];S.payments=[];S.requests=[];S.returns=Array.from({length:12},blankReturn);S.decisions={};S.vouch={};S.case={notice:"",type:"Field audit",received:"",due:"",auditor:"",scope:"",notes:""}}
  lastSent={};try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}sync.state="saving";render();pushRemote()}
async function checkSetup(){try{const r=await api("status");if(r.ok&&r.needsSetup){sync.state="setup";render()}}catch(e){sync.msg=L("Cannot reach the server. Check your internet connection.","تعذر الوصول إلى الخادم. تحقق من اتصالك بالإنترنت.");render()}}