// ================================================================ storage: Google Sheets (Apps Script) or browser
const REMOTE=!!(window.google&&google.script&&google.script.run);
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
function toTable(k){const s=SCHEMA[k];if(s.kind==="kv"){const o=s.get();return{headers:["key","value"],rows:Object.entries(o).map(([a,b])=>[a,String(b??"")])}}return{headers:s.headers,rows:s.get().map(r=>r.map(v=>String(v??"")))}}
function fromTable(k,t){const s=SCHEMA[k];if(!t||!t.rows)return;if(s.kind==="kv"){const o={};t.rows.forEach(r=>{if(r[0])o[r[0]]=r[1]??""});s.set(o)}else s.set(t.rows)}
let lastSent={}, sync={state:REMOTE?"loading":"local",at:null,msg:""}, sending=false, pending=false;
function setSync(state,msg){sync.state=state;sync.msg=msg||"";if(state==="saved")sync.at=new Date();const el=document.getElementById("sync");if(el)el.outerHTML=syncChip()}
function snapshotAll(){const o={};for(const k of Object.keys(SCHEMA))o[k]=JSON.stringify(toTable(k));return o}
function save(){
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){if(!REMOTE&&!saveWarned){saveWarned=true;toast("This data is too large to keep in the browser. It stays here until you close the page.")}}
  if(!REMOTE||sync.state==="loading"||sync.state==="choose")return;
  clearTimeout(saveTimer);setSync("pending");saveTimer=setTimeout(pushRemote,1200);
}
function pushRemote(){
  if(sending){pending=true;return}
  const snap=snapshotAll(), payload={};for(const k of Object.keys(snap))if(snap[k]!==lastSent[k])payload[k]=JSON.parse(snap[k]);
  if(!Object.keys(payload).length){setSync("saved");return}
  sending=true;setSync("saving");
  google.script.run.withSuccessHandler(()=>{Object.assign(lastSent,Object.fromEntries(Object.keys(payload).map(k=>[k,snap[k]])));sending=false;setSync("saved");if(pending){pending=false;pushRemote()}})
    .withFailureHandler(err=>{sending=false;setSync("error",err&&err.message||String(err))}).saveCollections(payload);
}
function loadRemote(){
  google.script.run.withSuccessHandler(res=>{
    sync.sheetUrl=res.sheetUrl;sync.user=res.user;
    if(res.empty){sync.state="choose";render();return}
    S=exampleState();S.example=false;S.tb=[];S.sales=[];S.purchases=[];S.payments=[];S.requests=[];S.decisions={};S.vouch={};
    for(const k of Object.keys(SCHEMA))if(res.data[k])fromTable(k,res.data[k]);
    S=migrate(S);lastSent=snapshotAll();setSync("saved");render();
  }).withFailureHandler(err=>{sync.state="error";sync.msg=err&&err.message||String(err);render()}).loadState();
}
function startRemote(withExample){S=exampleState();if(!withExample){S.example=false;S.tb=[];S.sales=[];S.purchases=[];S.payments=[];S.requests=[];S.returns=Array.from({length:12},blankReturn);S.decisions={};S.vouch={};S.case={notice:"",type:"Field audit",received:"",due:"",auditor:"",scope:"",notes:""}}
  lastSent={};sync.state="saving";render();pushRemote()}
