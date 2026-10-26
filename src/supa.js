// ================================================================ SaaS backend: Supabase (multi-company, email-code sign-in)
// Security lives in the database (Row Level Security): this key only lets a signed-in user reach companies they belong to.
const SB_URL="https://xuogrqrjdabhrmicqwhd.supabase.co";
const SB_KEY="sb_publishable_wNw9BzBBHFMWfpUaA6eIYg_97mL3Oxq";
const SUPA=REMOTE&&window.FAHS_BACKEND!=="gas";
let sb=null, COMPANY=null, COMPANIES=[], PLATFORM=false, TEAM=null, PLAT=null;
// Sessions live only in this tab (sessionStorage): every time the system is opened it starts at the sign-in page.
if(SUPA){try{Object.keys(localStorage).filter(k=>/^sb-.*-auth-token/.test(k)).forEach(k=>localStorage.removeItem(k))}catch(e){}}
const sbc=()=>{if(!sb)sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,storage:window.sessionStorage,autoRefreshToken:true,detectSessionInUrl:true}});return sb};
const ROLE_AR2={owner:"المالك",admin:"مدير",editor:"محرر",viewer:"مشاهد"};
const roleLabel=r=>LANG==="ar"?(ROLE_AR2[r]||r):({owner:"Owner",admin:"Admin",editor:"Editor",viewer:"Viewer"}[r]||r);
const SERR={rate:L("Too many codes were requested. Wait a minute and try again.","تم طلب رموز كثيرة. انتظر دقيقة ثم حاول مرة أخرى."),code:L("That code is wrong or has expired. Request a new one.","الرمز غير صحيح أو انتهت صلاحيته. اطلب رمزاً جديداً."),
  email:L("Enter a valid email address.","أدخل بريداً إلكترونياً صحيحاً."),net:L("Cannot reach the server. Check your internet connection.","تعذر الوصول إلى الخادم. تحقق من اتصالك بالإنترنت."),
  forbidden:L("You don't have permission for this.","ليست لديك صلاحية لهذا الإجراء."),suspended:L("This company is suspended. Contact the platform administrator.","هذه المنشأة موقوفة. تواصل مع مدير المنصة.")};
const sbErr=e=>{const m=String(e&&(e.message||e.error_description)||e||"");if(/rate|seconds|too many/i.test(m))return SERR.rate;if(/expired|invalid|otp|token/i.test(m))return SERR.code;if(/forbidden|permission|denied|policy/i.test(m))return SERR.forbidden;if(/fetch|network/i.test(m))return SERR.net;return m};

if(SUPA){
  // permissions now come from the company role
  canEdit=()=>!!COMPANY&&["owner","admin","editor"].includes(COMPANY.role)&&COMPANY.status!=="suspended";
  isAdmin=()=>!!COMPANY&&["owner","admin"].includes(COMPANY.role);
  signedOut=async msg=>{clearTimeout(saveTimer);pending=false;sending=false;try{await sbc().auth.signOut()}catch(e){}COMPANY=null;COMPANIES=[];TEAM=null;PLAT=null;AUTH.user=null;
    try{localStorage.removeItem(KEY);localStorage.removeItem(KEY+"-view")}catch(e){}cur="dash";S=exampleState();S.example=false;S.tb=[];S.sales=[];S.purchases=[];S.payments=[];S.requests=[];S.returns=Array.from({length:12},blankReturn);
    try{sessionStorage.removeItem(KEY+"-welcomed")}catch(e){}lastSent={};sync.state="login";sync.msg=msg||"";render()};
}

// ---------------------------------------------------------------- start-up and company selection
async function supaStart(){
  if(/access_token|error_description|[?&]code=/.test(location.hash+location.search))setTimeout(()=>{try{history.replaceState(null,"",location.pathname)}catch(e){}},1500);
  sync.state=HAD_CACHE?"refreshing":"loading";
  try{const {data:{session}}=await sbc().auth.getSession();if(!session){sync.state="login";render();return}await afterSignIn(session)}
  catch(e){sync.state="login";sync.msg=sbErr(e);render()}
}
let SIGNING=false;
async function afterSignIn(session){
  if(SIGNING)return;SIGNING=true;try{await afterSignIn2(session)}finally{SIGNING=false}
}
async function afterSignIn2(session){
  const u=session.user;AUTH.user={username:u.email,email:u.email,name:(u.user_metadata&&u.user_metadata.full_name)||u.email.split("@")[0],role:"viewer"};
  try{await sbc().rpc("accept_invitations")}catch(e){}
  try{const r=await sbc().rpc("is_platform_admin");PLATFORM=!!r.data}catch(e){PLATFORM=false}
  const {data,error}=await sbc().from("memberships").select("role, companies(id,name,vat_number,cr_number,status)").eq("user_id",u.id);
  if(error){sync.state="error";sync.msg=sbErr(error);render();return}
  COMPANIES=(data||[]).filter(m=>m.companies).map(m=>({...m.companies,role:m.role})).sort((a,b)=>a.name.localeCompare(b.name));
  if(!COMPANIES.length){sync.state="newco";sync.msg="";render();return}
  let pick=null;try{pick=localStorage.getItem(KEY+"-company")}catch(e){}
  const c=COMPANIES.find(x=>x.id===pick)||(COMPANIES.length===1?COMPANIES[0]:null);
  if(!c){sync.state="pick";render();return}
  await openCompany(c);
}
async function openCompany(c){
  COMPANY=c;AUTH.user.role=c.role;TEAM=null;try{localStorage.setItem(KEY+"-company",c.id)}catch(e){}
  sync.state="loading";render();
  const {data,error}=await sbc().from("datasets").select("year,key,data").eq("company_id",c.id);
  if(error){sync.state="error";sync.msg=sbErr(error);render();return}
  // rebuild the same {headers, rows} tables the app already understands
  const shared={},yearly={};
  for(const d of data||[]){if(!d.data||!d.data.headers)continue;if(d.year===""||!YEARLY.includes(d.key))shared[d.key]=d.data;else (yearly[d.key]=yearly[d.key]||[]).push(d)}
  const tables={...shared};
  for(const [k,list] of Object.entries(yearly)){const h=list[0].data.headers;tables[k]={headers:["year",...h],rows:list.flatMap(d=>(d.data.rows||[]).map(r=>[d.year,...r]))}}
  S=exampleState();S.example=false;S.tb=[];S.sales=[];S.purchases=[];S.payments=[];S.requests=[];S.decisions={};S.vouch={};S.returns=Array.from({length:12},blankReturn);
  S.case={notice:"",type:"Field audit",received:"",due:"",auditor:"",scope:"",notes:""};S.checklist=CHECKLIST.map(()=>({status:"Not started",owner:"",ref:"",notes:""}));
  if(!tables.setup){S.setup.company=c.name;S.setup.vat=c.vat_number||"";S.setup.cr=c.cr_number||""}
  window.__yearRows=null;pendingYears=null;for(const k of Object.keys(SCHEMA))if(tables[k])fromTable(k,tables[k]);finishYears(S.year);
  S=migrate(S);lastSent=snapshotAll();if(!(data||[]).length)lastSent={};
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  setSync("saved");cur=cur||"dash";render();
  if(!(data||[]).length&&canEdit())pushRemote(); // first visit: write the empty structure
}

// ---------------------------------------------------------------- saving: one row per company / year / dataset
if(SUPA)pushRemote=async function(){
  if(!COMPANY||!canEdit())return;
  if(sending){pending=true;return}
  const snap=snapshotAll(),changed=Object.keys(snap).filter(k=>snap[k]!==lastSent[k]);
  if(!changed.length){setSync("saved");return}
  sending=true;setSync("saving");
  const rows=[],uid=(await sbc().auth.getUser()).data.user?.id;
  for(const k of changed){const t=JSON.parse(snap[k]);
    if(YEARLY.includes(k)&&t.headers[0]==="year"){const by={};yearLabels().forEach(y=>by[y]=[]);t.rows.forEach(r=>{(by[r[0]]=by[r[0]]||[]).push(r.slice(1))});
      for(const [y,rs] of Object.entries(by))rows.push({company_id:COMPANY.id,year:y,key:k,data:{headers:t.headers.slice(1),rows:rs},updated_by:uid,updated_at:new Date().toISOString()})}
    else rows.push({company_id:COMPANY.id,year:"",key:k,data:t,updated_by:uid,updated_at:new Date().toISOString()})}
  try{const {error}=await sbc().from("datasets").upsert(rows,{onConflict:"company_id,year,key"});sending=false;
    if(error){setSync("error",sbErr(error));return}
    changed.forEach(k=>lastSent[k]=snap[k]);setSync("saved");
    sbc().from("audit_log").insert({company_id:COMPANY.id,user_id:uid,email:AUTH.user.email,action:"Saved",detail:changed.join(", ")}).then(()=>{});
    if(pending){pending=false;pushRemote()}}
  catch(e){sending=false;setSync("error",sbErr(e))}
};
