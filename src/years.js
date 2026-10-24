// ================================================================ multi-year inspections (e.g. 5 years)
// The active year's data lives in S (S.tb, S.returns, ...). Other years are parked in S.years[label].
// Shared across years: company settings, inspection case, ZATCA requests and the document checklist.
const YEARLY=["tb","returns","sales","purchases","payments","recItems","decisions","vouch","sample"];
const yearOf=fy=>String((D(fy)||D("2025-01-01")).getUTCFullYear());
function blankYear(label,freq){return{fy:`${label}-01-01`,freq:freq||"Monthly",tb:[],returns:Array.from({length:12},blankReturn),sales:[],purchases:[],payments:[],
  recItems:[{d:"Timing – invoices booked in a different period",a:""},{d:"Revenue accruals not yet invoiced",a:""},{d:"Other",a:""}],decisions:{},vouch:{},sample:{pop:"sales",size:"25",seed:label}}}
function ensureYears(){if(!S.years)S.years={};if(!S.year)S.year=yearOf(S.setup.fy);}
function activeSnap(){const o={fy:S.setup.fy,freq:S.setup.freq};YEARLY.forEach(k=>o[k]=S[k]);return o}
function allYears(){ensureYears();const m={...S.years};m[S.year]=activeSnap();return m}
const yearLabels=()=>Object.keys(allYears()).sort();
function switchYear(label){ensureYears();if(label===S.year)return;S.years[S.year]=activeSnap();const t=S.years[label]||blankYear(label,S.setup.freq);delete S.years[label];
  YEARLY.forEach(k=>S[k]=t[k]);S.setup.fy=t.fy;S.setup.freq=t.freq;S.year=label;UI.ret.p=0;try{localStorage.setItem(KEY+"-year",label)}catch(e){}}
function addYear(label){ensureYears();label=String(label);if(allYears()[label])return false;S.years[label]=blankYear(label,S.setup.freq);return true}
function removeYear(label){ensureYears();if(label===S.year||!S.years[label])return false;delete S.years[label];return true}
// run fn with another year temporarily active (used for the overview and for saving)
function withYear(label,fn){ensureYears();if(label===S.year)return fn();const keep=activeSnap(),t=S.years[label];YEARLY.forEach(k=>S[k]=t[k]);S.setup.fy=t.fy;S.setup.freq=t.freq;
  try{return fn()}finally{YEARLY.forEach(k=>S[k]=keep[k]);S.setup.fy=keep.fy;S.setup.freq=keep.freq}}

// ---- Sheet format: yearly tabs get a leading "year" column; a Years tab stores each year's start date and frequency
SCHEMA.years={kind:"rows",headers:["year","fy","freq"],get:()=>Object.entries(allYears()).sort().map(([y,v])=>[y,v.fy,v.freq]),set:()=>{}};
function toTable(k){
  if(!YEARLY.includes(k))return toTableRaw(k);
  const yrs=allYears();let headers=null;const rows=[];
  for(const y of Object.keys(yrs).sort()){const t=withYear(y,()=>toTableRaw(k));headers=t.headers;t.rows.forEach(r=>rows.push([y,...r]))}
  return{headers:["year",...(headers||toTableRaw(k).headers)],rows};
}
let pendingYears=null; // rows from the Years tab, applied after all tabs are read
function fromTable(k,t){
  if(k==="years"){pendingYears=t;return}
  if(!YEARLY.includes(k))return fromTableRaw(k,t);
  if(!t||!t.rows)return;
  const hasYear=t.headers&&t.headers[0]==="year";
  const groups={};
  if(!hasYear)groups[yearOf(S.setup.fy)]=t.rows; // older single-year format
  else t.rows.forEach(r=>{const y=String(r[0]||"").trim();if(y)(groups[y]=groups[y]||[]).push(r.slice(1))});
  const raw=hasYear?{headers:t.headers.slice(1)}:{headers:t.headers};
  if(!window.__yearRows)window.__yearRows={};
  for(const [y,rows] of Object.entries(groups)){(window.__yearRows[y]=window.__yearRows[y]||{})[k]={headers:raw.headers,rows}}
}
// Build S (active year) and S.years from what fromTable collected.
function finishYears(preferred){
  const rowsBy=window.__yearRows||{};window.__yearRows=null;
  const info={};(pendingYears&&pendingYears.rows||[]).forEach(r=>{if(r[0])info[String(r[0])]={fy:r[1]||`${r[0]}-01-01`,freq:r[2]||"Monthly"}});pendingYears=null;
  const labels=[...new Set([...Object.keys(info),...Object.keys(rowsBy)])].sort();
  if(!labels.length)labels.push(yearOf(S.setup.fy));
  const built={};
  for(const y of labels){const inf=info[y]||{fy:y===yearOf(S.setup.fy)?S.setup.fy:`${y}-01-01`,freq:S.setup.freq||"Monthly"};const yb=blankYear(y,inf.freq);yb.fy=inf.fy;
    const keep={};YEARLY.forEach(k=>keep[k]=S[k]);YEARLY.forEach(k=>S[k]=yb[k]);
    for(const k of YEARLY){const t=(rowsBy[y]||{})[k];if(t)fromTableRaw(k,t);yb[k]=S[k]}
    YEARLY.forEach(k=>S[k]=keep[k]);built[y]=yb}
  let act=preferred&&built[preferred]?preferred:null;try{const saved=localStorage.getItem(KEY+"-year");if(!act&&saved&&built[saved])act=saved}catch(e){}
  if(!act)act=labels[labels.length-1];
  const a=built[act];delete built[act];YEARLY.forEach(k=>S[k]=a[k]);S.setup.fy=a.fy;S.setup.freq=a.freq;S.year=act;S.years=built;
}
// overview: compute every year
function computeAllYears(){return yearLabels().map(y=>({y,C:withYear(y,()=>compute())}))}
function relabelActive(){ensureYears();const ny=yearOf(S.setup.fy);if(ny!==S.year&&!S.years[ny]){try{localStorage.setItem(KEY+"-year",ny)}catch(e){}S.year=ny}}
