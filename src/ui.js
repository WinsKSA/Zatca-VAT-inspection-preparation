// ================================================================ icons (24px line icons)
const IC={
 home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 case:'<path d="M3 7h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M3 12h18"/>',
 hub:'<ellipse cx="12" cy="5.5" rx="8" ry="2.5"/><path d="M4 5.5v13c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-13"/><path d="M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5"/>',
 tb:'<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M9 9v11M15 9v11"/>',
 ret:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/>',
 up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
 down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
 pay:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3 10h18M7 15h4"/>',
 test:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 14h9"/>',
 scale:'<path d="M12 4v16M5 20h14M6 8h12"/><path d="M6 8l-3 6a3 3 0 0 0 6 0zM18 8l-3 6a3 3 0 0 0 6 0z"/>',
 rev:'<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
 dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/>',
 flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
 pack:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
 book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/>',
 sheet:'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M4 9h16M4 15h16M10 9v12"/>',
 check:'<path d="M5 12l5 5 9-10"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>', dot:'<circle cx="12" cy="12" r="3"/>', alert:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
 lang:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>', upl:'<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>'};
const icon=(n,cls="")=>`<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||""}</svg>`;
const STI={ok:"check",bad:"x",none:"dot",pass:"check",fail:"x",na:"dot"};
const pill=(k,t)=>`<span class="pill ${k}">${STI[k]?icon(STI[k]):""}${esc(t)}</span>`;
const sp=s=>s==="ok"?pill("ok","Matched"):s==="bad"?pill("bad","Investigate"):pill("none","No activity");
L("Matched","مطابق");L("Investigate","يحتاج إلى فحص");
const sevPill=s=>`<span class="sev ${s}">${esc(SEV[s])}</span>`;
const nc=(v,bad)=>`<td class="n${bad?" neg":""}">${fmt(v)}</td>`;
const dc=(v,tol)=>nc(v,Math.abs(v)>tol);

// ================================================================ navigation
const VIEWS=[
 {g:L("Overview","نظرة عامة")},{id:"dash",t:L("Command center","مركز القيادة"),i:"home"},{id:"case",t:L("Inspection case","ملف الفحص"),i:"case"},
 {g:L("Data","البيانات")},{id:"hub",t:L("Data hub","مركز البيانات"),i:"hub"},{id:"tb",t:"Trial balance",i:"tb"},{id:"ret",t:"VAT returns",i:"ret"},{id:"sales",t:"Sales register",i:"up"},{id:"pur",t:"Purchase register",i:"down"},{id:"pay",t:"Payments to ZATCA",i:"pay"},
 {g:L("Analysis","التحليل")},{id:"tests",t:L("Test library","مكتبة الاختبارات"),i:"test"},{id:"rsales",t:"Sales by VAT box",i:"scale"},{id:"rrev",t:"Revenue vs returns",i:"rev"},{id:"rout",t:"Output VAT",i:"up"},{id:"rin",t:"Input VAT",i:"down"},{id:"rvat",t:"VAT account & penalties",i:"pay"},{id:"samp",t:L("Sampling","العينات"),i:"dice"},
 {g:L("Response","الرد على الهيئة")},{id:"find",t:L("Findings & exposure","الملاحظات والتعرض"),i:"flag"},{id:"chk",t:L("Response pack","ملف الرد"),i:"pack"},{id:"method",t:L("Methodology","المنهجية"),i:"book"},{id:"setup",t:L("Settings","الإعدادات"),i:"gear"}];
let cur="dash";try{const h=location.hash.slice(1);if(VIEWS.some(v=>v.id===h))cur=h;else{const v=localStorage.getItem(KEY+"-view");if(v&&VIEWS.some(x=>x.id===v))cur=v}}catch(e){}
const UI={ret:{p:0},tests:{f:"fail",open:{}},find:{}};
function navCounts(C){const f=a=>C.tests.filter(t=>t.status==="fail"&&a.includes(t.go)).length;
  return{tests:C.tests.filter(t=>t.status==="fail").length,sales:C.sFlag,pur:C.pFlag,rsales:C.salesRec.flatMap(x=>x.rows).filter(r=>r.s==="bad").length,rout:C.outRec.filter(r=>r.s==="bad").length,rin:C.inRec.filter(r=>r.s==="bad").length,rvat:C.vatRec.filter(r=>r.s==="bad").length,rrev:Math.abs(C.rev.unexpl)>C.c.tol?1:0,ret:C.rets.filter(r=>r.arith==="bad"||r.late==="bad").length,tb:C.tbCheck.filter(x=>Math.abs(x)>0.005).length+C.unmapped,case:openReq().filter(r=>r.overdue).length}}
function openReq(){const t=todayD();return S.requests.map(r=>{const d=D(r.due);return{...r,days:d?daysBetween(t,d):null,overdue:!!(d&&d<t&&r.status!=="Submitted"&&r.status!=="Closed")}})}
function renderNav(C){const n=navCounts(C);
  $("#nav").innerHTML=`<div class="brand"><svg viewBox="0 0 40 40" class="logo" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="10" fill="var(--brand)"/><circle cx="18" cy="18" r="8" fill="none" stroke="#fff" stroke-width="3"/><path d="M24 24l7 7" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M14.5 18.5l2.5 2.5 4.5-5" fill="none" stroke="var(--gold-2)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div><div class="wordmark">${LANG==="ar"?"فحص":"Fahs"}</div><div class="tagline">${esc(L("VAT inspection command center","مركز قيادة فحص ضريبة القيمة المضافة"))}</div></div></div>
  <div class="entity"><div class="ename" data-notr>${esc(S.setup.company||"—")}</div><div class="evat num">${esc(S.setup.vat||"")}</div></div>
  ${VIEWS.map(v=>v.g?`<div class="nav-group">${esc(v.g)}</div>`:`<button class="nav-btn" data-v="${v.id}" aria-current="${v.id===cur}">${icon(v.i)}<span class="nl">${esc(v.t)}</span>${n[v.id]?`<span class="badge">${n[v.id]}</span>`:""}</button>`).join("")}
  <div class="nav-foot">${icon("sheet")}<span>${esc(REMOTE?L("Data saved in your Google Sheet","البيانات محفوظة في جدول Google الخاص بك"):L("Data stays in this browser","البيانات تبقى في هذا المتصفح"))}</span></div>`;
}
$("#nav").addEventListener("click",e=>{const b=e.target.closest("[data-v]");if(b)go(b.dataset.v)});
function go(v){cur=v;try{localStorage.setItem(KEY+"-view",v)}catch(e){}render();$("#main").scrollTo?.(0,0);window.scrollTo(0,0)}
function syncChip(){const m={local:[L("Saved in this browser","محفوظ في هذا المتصفح"),"none"],loading:[L("Connecting to Google Sheets…","جارٍ الاتصال بجداول Google…"),"warn"],choose:[L("Google Sheet connected","تم الاتصال بجدول Google"),"ok"],pending:[L("Unsaved changes","تغييرات غير محفوظة"),"warn"],saving:[L("Saving to Google Sheets…","جارٍ الحفظ في جداول Google…"),"warn"],saved:[L("Saved to Google Sheets","تم الحفظ في جداول Google"),"ok"],error:[L("Not saved – retrying on next change","لم يُحفظ – ستتم إعادة المحاولة عند التغيير التالي"),"bad"]}[sync.state]||["",""];
  return `<span id="sync" class="chip-s ${m[1]}" title="${esc(sync.msg)}">${icon(m[1]==="ok"?"check":m[1]==="bad"?"alert":"sheet")}${esc(m[0])}</span>`}
function topbar(){const v=VIEWS.find(x=>x.id===cur)||{t:""};const due=D(S.case.due);let dl="";
  if(due){const d=daysBetween(todayD(),due);dl=`<span class="chip-s ${d<0?"bad":d<=7?"warn":"none"}">${icon("clock")}${esc(d<0?L(`Response overdue by ${-d} days`,`الرد متأخر ${-d} يوم`):L(`Response due in ${d} days`,`موعد الرد خلال ${d} يوم`))}</span>`}
  return `<header class="topbar"><div class="tb-title"><h1>${esc(v.t)}</h1></div><div class="tb-actions">${dl}${syncChip()}<button class="btn ghost" id="langBtn" data-notr lang="${LANG==="ar"?"en":"ar"}">${icon("lang")}${LANG==="ar"?"English":"العربية"}</button></div></header>`}
function render(){
  const m=$("#main");
  if(sync.state==="loading"){m.innerHTML=`<div class="splash"><div class="spinner"></div><p>${esc(L("Connecting to your Google Sheet…","جارٍ الاتصال بجدول Google الخاص بك…"))}</p></div>`;$("#nav").innerHTML="";return}
  if(sync.state==="choose"){m.innerHTML=`<div class="splash"><h2>${esc(L("Your Google Sheet is connected","تم ربط جدول Google الخاص بك"))}</h2><p>${esc(L("The sheet is empty. How do you want to start?","الجدول فارغ. كيف تريد أن تبدأ؟"))}</p><div class="row center"><button class="btn primary" id="stEx">${esc(L("Start with example data","البدء ببيانات توضيحية"))}</button><button class="btn" id="stEmpty">${esc(L("Start empty","البدء بجداول فارغة"))}</button></div></div>`;$("#nav").innerHTML="";$("#stEx").onclick=()=>startRemote(true);$("#stEmpty").onclick=()=>startRemote(false);return}
  const C=compute();renderNav(C);
  m.innerHTML=topbar()+`<div class="content">${S.example?exampleBanner():""}${(R[cur]||R.dash)(C)}</div>`;
  (AFTER[cur]||(()=>{}))(C);bindCommon();
}
function exampleBanner(){return `<div class="banner">${icon("alert")}<span><b>${esc(L("Example data.","بيانات توضيحية."))}</b> ${esc(L("January–February 2025 contain sample figures with deliberate errors so you can see what the system catches.","يناير وفبراير 2025 يحتويان على أرقام تجريبية بها أخطاء متعمدة لتوضيح ما يكتشفه النظام."))}</span><span class="grow"></span><button class="btn sm" data-act="import">${icon("upl")}${esc("Import my Excel workbook")}</button><button class="btn sm danger" data-act="clear">${esc("Clear example data")}</button></div>`}
function bindCommon(){
  document.querySelectorAll('[data-act="clear"]').forEach(b=>b.onclick=()=>confirmBox("Remove all data (example or your own) and start with empty tables? Company settings are kept.","Clear all data",()=>{const keep=S.setup;S=exampleState();S.setup=keep;S.example=false;S.tb=[];S.sales=[];S.purchases=[];S.payments=[];S.requests=[];S.decisions={};S.vouch={};S.returns=Array.from({length:12},blankReturn);save();render();toast("All tables cleared")}));
  document.querySelectorAll('[data-act="import"]').forEach(b=>b.onclick=()=>pickFile(importWorkbook));
  document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
  document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>copyText(tableTSV(document.getElementById(b.dataset.copy))));
  const lb=$("#langBtn");if(lb)lb.onclick=()=>{LANG=LANG==="ar"?"en":"ar";try{localStorage.setItem(KEY+"-lang",LANG)}catch(e){}applyLang();render()};
}
function tableTSV(t){return [...t.querySelectorAll("tr")].map(tr=>[...tr.children].map(td=>{const i=td.querySelector("input,select");return (i?(i.tagName==="SELECT"?(i.options[i.selectedIndex]||{text:""}).text:i.value):td.innerText).replace(/[\t\n]+/g," ").trim()}).join("\t")).join("\n")}
function pickFile(cb){const i=document.createElement("input");i.type="file";i.accept=".xlsx,.xls,.xlsm,.csv";i.onchange=()=>{const f=i.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{if(typeof XLSX==="undefined")throw new Error("lib");cb(XLSX.read(new Uint8Array(rd.result),{type:"array",cellDates:false}))}catch(e){toast(e.message==="lib"?"The Excel reader didn't load. Check your connection and reload, or paste the data instead.":"That file couldn't be read. Save it as .xlsx and try again.")}};rd.readAsArrayBuffer(f)};i.click()}
const dropTotal=r=>[...r.slice(0,9),...r.slice(10)]; // workbook column J is a calculated total
const sheetRows=ws=>XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:""});
const card=(title,body,extra="",cls="")=>`<section class="card ${cls}">${title?`<div class="card-h"><h2>${esc(title)}</h2>${extra}</div>`:""}${body}</section>`;
const tile=(lab,val,sub="",cls="")=>`<div class="tile ${cls}"><span class="t-lab">${esc(lab)}</span><span class="t-val">${val}</span>${sub?`<span class="t-sub">${sub}</span>`:""}</div>`;
const R={}, AFTER={};

// ================================================================ command center
R.dash=C=>{
  const E=C.exposure, sc=C.score, fails=C.tests.filter(t=>t.status==="fail"), bySev=s=>fails.filter(t=>t.sev===s).length;
  const scLab=sc==null?L("No data yet","لا توجد بيانات بعد"):sc>=85?L("Strong","قوي"):sc>=65?L("Needs attention","يحتاج إلى اهتمام"):L("At risk","معرّض للمخاطر");
  const scCls=sc==null?"none":sc>=85?"ok":sc>=65?"warn":"bad";
  const due=D(S.case.due), days=due?daysBetween(todayD(),due):null, rq=openReq(), openN=rq.filter(r=>r.status!=="Submitted"&&r.status!=="Closed").length;
  const rows=[...C.salesRec.map(x=>({lab:L(`Sales – Box ${x.b}`,`المبيعات – خانة ${x.b}`),go:"rsales",cells:x.rows.map(r=>r.s)})),
    {lab:"Output VAT",go:"rout",cells:C.outRec.map(r=>r.s)},{lab:"Input VAT",go:"rin",cells:C.inRec.map(r=>r.s)},
    {lab:L("VAT control account","حساب الضريبة"),go:"rvat",cells:C.vatRec.map(r=>r.s)},{lab:"Return arithmetic",go:"ret",cells:C.rets.map(r=>r.arith)},{lab:"Filed on time",go:"ret",cells:C.rets.map(r=>r.late)}];
  const top=[...fails].sort((a,b)=>b.tax-a.tax||({high:3,medium:2,low:1}[b.sev]-{high:3,medium:2,low:1}[a.sev])).slice(0,6);
  const activeP=C.ps.filter((p,i)=>C.rets[i].entered||C.outRec[i].gl||C.outRec[i].reg);
  const cats=(activeP.length?activeP:C.ps.slice(0,3)).map(p=>p.short), idx=(activeP.length?activeP:C.ps.slice(0,3)).map(p=>p.i);
  return `<div class="tiles">
   <div class="tile hero ${scCls}"><span class="t-lab">${esc(L("Compliance score","مؤشر الالتزام"))}</span><span class="t-val big">${sc==null?"–":sc}<small>/100</small></span><div class="meter"><span style="width:${sc||0}%"></span></div><span class="t-sub">${pill(scCls==="warn"?"warn":scCls,scLab)}<span>${esc(L(`${C.tests.filter(t=>t.status!=="na").length} tests applied`,`${C.tests.filter(t=>t.status!=="na").length} اختبار مطبق`))}</span></span></div>
   <div class="tile hero"><span class="t-lab">${esc(L("Indicative exposure","التعرض التقديري"))}</span><span class="t-val big num">${fmt0(E.A)}<small> SAR</small></span><span class="t-sub"><span>${esc(L("With fines initiative","مع مبادرة الإعفاء من الغرامات"))}</span><b class="num">${fmt0(E.B)} SAR</b>${E.active?pill("ok",L(`${E.daysLeft} days left`,`متبقي ${E.daysLeft} يوم`)):pill("none",L("Not active","غير سارية"))}</span></div>
   <div class="tile hero ${days!=null&&days<=7?"bad":""}"><span class="t-lab">${esc(L("Response deadline","موعد الرد"))}</span><span class="t-val big num">${days==null?"–":days<0?-days:days}<small> ${esc(days!=null&&days<0?L("days overdue","يوم تأخير"):L("days","يوم"))}</small></span><span class="t-sub">${due?`<span>${esc(showDate(due))}</span><span>·</span>`:""}<span>${esc(L(`${openN} ZATCA requests open`,`${openN} طلب مفتوح من الهيئة`))}</span></span></div>
   <div class="tile hero"><span class="t-lab">${esc(L("Open findings","الملاحظات المفتوحة"))}</span><span class="t-val big num">${fails.length}</span><span class="t-sub sevrow">${sevPill("high")}<b class="num">${bySev("high")}</b>${sevPill("medium")}<b class="num">${bySev("medium")}</b>${sevPill("low")}<b class="num">${bySev("low")}</b></span></div>
  </div>
  <div class="grid2">
   ${card(L("Reconciliation status by period","حالة المطابقة حسب الفترة"),`<div class="frame"><table class="heat"><thead><tr><th>${esc("Check")}</th>${C.ps.map(p=>`<th class="c">${esc(p.short)}</th>`).join("")}</tr></thead><tbody>
    ${rows.map(r=>`<tr><td><button class="link" data-go="${r.go}">${esc(r.lab)}</button></td>${r.cells.map((c,i)=>`<td class="h" data-go="${r.go}" ${tipAttr(`${tr(r.lab)} · ${tr(C.ps[i].label)}`)}><span class="cell ${c}">${icon(STI[c])}</span></td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <p class="note">${esc(L(`Matched within SAR ${fmt(C.c.tol)} · needs investigation · no activity. Click a row to open it.`,`مطابق ضمن ${fmt(C.c.tol)} ريال · يحتاج إلى فحص · لا يوجد نشاط. اضغط على أي صف لفتحه.`))}</p>`)}
   ${card(L("Where the exposure comes from","مصادر التعرض"),barList([{label:L("Under-declared output VAT","ضريبة مخرجات غير مُقر بها"),value:E.out,c:"s2"},{label:L("Over-claimed input VAT","ضريبة مدخلات مخصومة بالزيادة"),value:E.inp,c:"s2"},{label:L("Incorrect-return penalty (50%)","غرامة الإقرار الخاطئ (50%)"),value:E.pen,c:"s1"},{label:L("Late payment penalties","غرامات التأخر في السداد"),value:E.latePay,c:"s1"},{label:L("Late filing penalty (minimum 5%)","غرامة التأخر في التقديم (5% كحد أدنى)"),value:E.lateFile,c:"s1"}])+`<div class="sum-row"><span>${esc(L("Total without initiative","الإجمالي دون المبادرة"))}</span><b class="num">${fmt(E.A)}</b></div><div class="sum-row good"><span>${esc(L("Penalties the initiative can remove","الغرامات التي يمكن أن تلغيها المبادرة"))}</span><b class="num">(${fmt(E.waived)})</b></div><div class="sum-row tot"><span>${esc(L("Total with initiative","الإجمالي مع المبادرة"))}</span><b class="num">${fmt(E.B)}</b></div>`,`<button class="btn sm ghost" data-go="find">${esc(L("Details","التفاصيل"))}</button>`)}
  </div>
  <div class="grid2">
   ${card(L("Output VAT: declared vs ledger","ضريبة المخرجات: المُقر بها مقابل الدفاتر"),columnChart(cats,[{name:L("Declared in return","المُقر بها في الإقرار"),c:"s1",values:idx.map(i=>C.outRec[i].ret)},{name:L("Booked in ledger","المسجلة في الدفاتر"),c:"s2",values:idx.map(i=>C.outRec[i].gl)}]),`<button class="btn sm ghost" data-go="rout">${esc(L("Open","فتح"))}</button>`)}
   ${card(L("Input VAT: claimed vs defensible","ضريبة المدخلات: المخصومة مقابل القابلة للدفاع"),columnChart(cats,[{name:L("Claimed in return","المخصومة في الإقرار"),c:"s1",values:idx.map(i=>C.inRec[i].ret)},{name:L("Defensible","القابلة للدفاع عنها"),c:"s3",values:idx.map(i=>C.inRec[i].df)}]),`<button class="btn sm ghost" data-go="rin">${esc(L("Open","فتح"))}</button>`)}
  </div>
  ${card(L("Top findings","أهم الملاحظات"),top.length?`<div class="frame"><table class="tbl"><thead><tr><th>ID</th><th>${esc(L("Finding","الملاحظة"))}</th><th>${esc(L("Severity","الخطورة"))}</th><th class="n">${esc(L("Items","البنود"))}</th><th class="n">${esc(L("Tax at risk (SAR)","الضريبة المعرضة (ريال)"))}</th><th></th></tr></thead><tbody>${top.map(t=>`<tr><td class="mono">${t.id}</td><td>${esc(t.title)}</td><td>${sevPill(t.sev)}</td><td class="n">${t.count}</td>${nc(t.tax)}<td><button class="btn sm ghost" data-test="${t.id}">${esc(L("Review","مراجعة"))}</button></td></tr>`).join("")}</tbody></table></div>`:`<p class="empty">${icon("check")}${esc(L("No findings in the data entered so far.","لا توجد ملاحظات في البيانات المدخلة حتى الآن."))}</p>`,`<button class="btn sm ghost" data-go="tests">${esc(L("All tests","جميع الاختبارات"))}</button>`)}`;
};
AFTER.dash=()=>document.querySelectorAll("[data-test]").forEach(b=>b.onclick=()=>{UI.tests.f="all";UI.tests.open={[b.dataset.test]:true};go("tests");setTimeout(()=>document.getElementById("t-"+b.dataset.test)?.scrollIntoView({block:"start"}),50)});

// ================================================================ inspection case
R.case=C=>{const c=S.case;const f=(id,lab,inp)=>`<label class="fld"><span>${esc(lab)}</span>${inp}</label>`;const I=(id,type="text")=>`<input id="c-${id}" data-c="${id}" type="${type}" value="${esc(c[id])}">`;
  const rq=openReq();
  return `<p class="lead">${esc(L("Everything about the ZATCA inspection in one place: the notice, every request ZATCA makes, and its deadline.","كل ما يخص فحص الهيئة في مكان واحد: الإشعار، وكل طلب من الهيئة، وموعده."))}</p>
  ${card(L("ZATCA notice","إشعار الهيئة"),`<div class="form-grid">${f("notice",L("Notice / case number","رقم الإشعار / الملف"),I("notice"))}${f("type",L("Inspection type","نوع الفحص"),`<select id="c-type" data-c="type">${AUDIT_TYPES.map(o=>`<option value="${o}"${o===c.type?" selected":""}>${esc(L(o,{"Desk audit":"فحص مكتبي","Field audit":"فحص ميداني","Information request":"طلب معلومات","Refund review":"مراجعة استرداد"}[o]))}</option>`).join("")}</select>`)}${f("received",L("Notice received","تاريخ استلام الإشعار"),I("received","date"))}${f("due",L("Response due","موعد الرد"),I("due","date"))}${f("auditor",L("ZATCA auditor","مدقق الهيئة"),I("auditor"))}${f("scope",L("Periods in scope","الفترات محل الفحص"),I("scope"))}</div>${f("notes",L("Notes","ملاحظات"),`<textarea id="c-notes" data-c="notes" rows="2">${esc(c.notes)}</textarea>`)}`)}
  ${card(L("ZATCA requests","طلبات الهيئة"),`<div class="frame"><table class="tbl edit" id="t-req"><thead><tr><th>#</th><th>${esc(L("What ZATCA asked for","المطلوب من الهيئة"))}</th><th>${esc(L("Requested","تاريخ الطلب"))}</th><th>${esc(L("Due","الاستحقاق"))}</th><th>${esc("Status")}</th><th>${esc(L("Sent on","تاريخ الإرسال"))}</th><th>${esc(L("Reference","المرجع"))}</th><th>${esc(L("Deadline","المهلة"))}</th><th></th></tr></thead><tbody>
   ${rq.map((r,i)=>`<tr><td class="rowno">${i+1}</td><td><input data-r="${i}" data-f="item" value="${esc(r.item)}" style="min-width:260px"></td><td><input type="date" data-r="${i}" data-f="req" value="${esc(r.req)}"></td><td><input type="date" data-r="${i}" data-f="due" value="${esc(r.due)}"></td><td><select data-r="${i}" data-f="status">${REQ_STATUS.map(o=>`<option value="${o}"${o===r.status?" selected":""}>${esc(L(o,{"Open":"مفتوح","In preparation":"قيد الإعداد","Submitted":"تم الإرسال","Closed":"مغلق"}[o]))}</option>`).join("")}</select></td><td><input type="date" data-r="${i}" data-f="sent" value="${esc(r.sent)}"></td><td><input data-r="${i}" data-f="ref" value="${esc(r.ref)}"></td><td>${r.status==="Submitted"||r.status==="Closed"?pill("ok",L("Done","منجز")):r.days==null?"":r.overdue?pill("bad",L(`${-r.days} days overdue`,`متأخر ${-r.days} يوم`)):pill(r.days<=3?"warn":"none",L(`${r.days} days left`,`متبقي ${r.days} يوم`))}</td><td><button class="del" data-del="${i}" aria-label="Delete row">×</button></td></tr>`).join("")||`<tr><td colspan="9" class="empty">${esc(L("No requests yet. Add each item ZATCA asks for.","لا توجد طلبات بعد. أضف كل بند تطلبه الهيئة."))}</td></tr>`}
  </tbody></table></div><div class="row"><button class="btn sm primary" id="addReq">${esc(L("Add request","إضافة طلب"))}</button><button class="btn sm" data-copy="t-req">${esc("Copy table")}</button></div>`)}
  ${card(L("ZATCA inspection process","مراحل فحص الهيئة"),`<ol class="steps">${[[L("Risk selection","اختيار الحالة"),L("ZATCA analytics flag mismatches, frequent amendments, large refunds, e-invoice inconsistencies.","تحليلات الهيئة ترصد الفروق، والتعديلات المتكررة، والاستردادات الكبيرة، وتعارضات الفوترة الإلكترونية.")],[L("Notice","الإشعار"),L("At least 20 days' notice before a field visit, unless non-compliance is suspected.","إشعار قبل 20 يوماً على الأقل من الزيارة الميدانية، ما لم يُشتبه في عدم الالتزام.")],[L("Document requests","طلب المستندات"),L("Returns, invoices, contracts, bank statements, reconciliations, e-invoice data.","الإقرارات والفواتير والعقود وكشوف البنوك والمطابقات وبيانات الفوترة الإلكترونية.")],[L("Queries","الاستفسارات"),L("Follow-up questions on differences. Answer in writing, within the deadline.","أسئلة متابعة حول الفروق. أجب كتابةً وخلال المهلة.")],[L("Assessment","التقييم"),L("Adjustments, penalties and any additional tax.","التعديلات والغرامات وأي ضريبة إضافية.")],[L("Objection","الاعتراض"),L("Object within the statutory deadline, then the GSTC committees.","الاعتراض خلال المهلة النظامية، ثم لجان الفصل الضريبية.")]].map(([a,b],i)=>`<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join("")}</ol>`)}`};
AFTER.case=()=>{document.querySelectorAll("[data-c]").forEach(el=>{el.addEventListener("input",()=>{S.case[el.dataset.c]=el.value;save()});el.addEventListener("change",()=>{S.case[el.dataset.c]=el.value;save();render()})});
  document.querySelectorAll("[data-r]").forEach(el=>{const h=()=>{S.requests[+el.dataset.r][el.dataset.f]=el.value;save()};el.addEventListener("input",h);el.addEventListener("change",()=>{h();render()})});
  document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{S.requests.splice(+b.dataset.del,1);save();render()});
  $("#addReq").onclick=()=>{S.requests.push({item:"",req:iso(todayD()),due:"",status:"Open",sent:"",ref:""});save();render()}};

// ================================================================ data hub
R.hub=C=>{const ds=[["tb","Trial balance",S.tb.length,L("accounts","حساب"),C.tbCheck.some(x=>Math.abs(x)>0.005)?L("Out of balance","غير متوازن"):C.unmapped?L(`${C.unmapped} unmapped`,`${C.unmapped} بدون تصنيف`):"",S.tb.length?"":"empty"],
   ["ret","VAT returns",C.rets.filter(r=>r.entered).length,L("periods entered","فترة مدخلة"),C.rets.some(r=>r.arith==="bad")?L("Arithmetic errors","أخطاء حسابية"):""],
   ["sales","Sales register",S.sales.length,L("invoices","فاتورة"),C.sFlag?L(`${C.sFlag} with exceptions`,`${C.sFlag} بها ملاحظات`):""],
   ["pur","Purchase register",S.purchases.length,L("invoices","فاتورة"),C.pFlag?L(`${C.pFlag} with exceptions`,`${C.pFlag} بها ملاحظات`):""],
   ["pay","Payments to ZATCA",S.payments.length,L("payments","دفعة"),""],
   ["case","Inspection case",S.requests.length,L("ZATCA requests","طلب من الهيئة"),""]];
  return `<p class="lead">${esc(L("Load each dataset once. Every test and reconciliation updates instantly.","حمّل كل مجموعة بيانات مرة واحدة، وتتحدث جميع الاختبارات والمطابقات فوراً."))}</p>
  <div class="tiles six">${ds.map(([go,t,n,u,issue])=>`<button class="tile ds" data-go="${go}"><span class="t-lab">${esc(t)}</span><span class="t-val num">${fmtInt(n)}<small> ${esc(u)}</small></span><span class="t-sub">${!n?pill("none",L("No data","لا توجد بيانات")):issue?pill("bad",issue):pill("ok",L("Looks complete","مكتمل"))}</span></button>`).join("")}</div>
  ${card(L("Import","الاستيراد"),`<div class="drop" id="drop">${icon("upl","lg")}<div><b>${esc(L("Import the VAT Inspection Pack workbook (Arabic or English)","استيراد ملف حزمة الفحص (عربي أو إنجليزي)"))}</b><p>${esc(L("Drop the .xlsx here or choose it. It replaces the data in every table.","أفلت ملف ‎.xlsx هنا أو اختره. سيستبدل البيانات في جميع الجداول."))}</p></div><button class="btn primary" data-act="import">${esc(L("Choose file","اختيار ملف"))}</button></div>
   <p class="note">${esc(L("You can also paste straight from Excel into any table, or import one table at a time from its own page.","يمكنك أيضاً اللصق مباشرة من Excel في أي جدول، أو استيراد كل جدول من صفحته."))}</p>`)}
  ${card(L("Storage","التخزين"),REMOTE?`<p>${esc(L("Every change is saved to your Google Sheet, one tab per dataset, with an audit log tab.","يُحفظ كل تغيير في جدول Google الخاص بك، بورقة لكل مجموعة بيانات، مع ورقة لسجل التدقيق."))}</p>${sync.sheetUrl?`<a class="btn" href="${esc(sync.sheetUrl)}" target="_blank" rel="noopener">${icon("ext")}${esc(L("Open the Google Sheet","فتح جدول Google"))}</a>`:""}`:`<p>${esc(L("This copy saves in this browser only. Deploy the Google Apps Script version to save everything in a Google Sheet your team can share.","هذه النسخة تحفظ في هذا المتصفح فقط. انشر نسخة Google Apps Script لحفظ كل شيء في جدول Google يمكن لفريقك مشاركته."))}</p>`)}
  <div class="row"><button class="btn" id="loadEx">${esc("Load example data")}</button><button class="btn danger" data-act="clear">${esc("Clear all tables")}</button></div>`};
AFTER.hub=()=>{$("#loadEx").onclick=()=>confirmBox("Replace everything with the example data?","Load example",()=>{S=exampleState();save();render()});
  const d=$("#drop");d.addEventListener("dragover",e=>{e.preventDefault();d.classList.add("over")});d.addEventListener("dragleave",()=>d.classList.remove("over"));
  d.addEventListener("drop",e=>{e.preventDefault();d.classList.remove("over");const f=e.dataTransfer.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{importWorkbook(XLSX.read(new Uint8Array(rd.result),{type:"array",cellDates:false}))}catch(err){toast("That file couldn't be read. Save it as .xlsx and try again.")}};rd.readAsArrayBuffer(f)})};
