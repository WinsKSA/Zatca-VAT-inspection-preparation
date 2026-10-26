// ================================================================ motion, start-here panel, storage note
const REDUCED=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
UI.anim=true; // animate the first screen
IC.play='<path d="M7 5l12 7-12 7z"/>';IC.prev='<path d="M15 6l-6 6 6 6"/>';IC.next='<path d="M9 6l6 6-6 6"/>';
function countUp(){document.querySelectorAll("[data-count]").forEach(el=>{const end=+el.dataset.count;if(!isFinite(end)||end===0)return;const t0=performance.now(),dur=700;
  const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=Math.round(end*e).toLocaleString("en-US");if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)})}
function localBanner(){return `<div class="banner info">${icon("sheet")}<span>${esc(L("This demo copy saves only in this browser. Enter your company's real data in the online app, where each company has its own private workspace.","هذه النسخة التجريبية تحفظ في هذا المتصفح فقط. أدخل بيانات منشأتك الفعلية في التطبيق المباشر، حيث لكل منشأة مساحة عمل خاصة."))}</span><span class="grow"></span><a class="btn sm primary" href="./">${icon("lock")}${esc(L("Open the online app","فتح التطبيق المباشر"))}</a></div>`}

function startHere(C){const s=S.setup;
  const steps=[[L("Company and VAT number","المنشأة والرقم الضريبي"),!!s.company&&vatOk(s.vat),"setup"],[L("Trial balance (monthly movements)","ميزان المراجعة (الحركات الشهرية)"),S.tb.length>0,"tb"],
    [L(s.freq==="Quarterly"?"VAT returns (4 quarters)":"VAT returns (12 months)",s.freq==="Quarterly"?"الإقرارات الضريبية (4 أرباع)":"الإقرارات الضريبية (12 شهراً)"),C.rets.some(r=>r.entered),"ret"],
    [L("Sales register","سجل المبيعات"),S.sales.length>0,"sales"],[L("Purchase register","سجل المشتريات"),S.purchases.length>0,"pur"],[L("Payments to ZATCA","المدفوعات للهيئة"),S.payments.length>0,"pay"],
    [L("ZATCA notice and requests","إشعار الهيئة وطلباتها"),!!S.case.notice||S.requests.length>0,"case"]];
  const done=steps.filter(x=>x[1]).length;
  const seg=["Monthly","Quarterly"].map(f=>`<button class="seg-b" data-freq="${f}" aria-pressed="${s.freq===f}"><b>${esc(f)}</b><small>${esc(f==="Monthly"?L("12 returns a year · supplies above SAR 40M","12 إقراراً سنوياً · توريدات تتجاوز 40 مليون ريال"):L("4 returns a year · supplies up to SAR 40M","4 إقرارات سنوياً · توريدات حتى 40 مليون ريال"))}</small></button>`).join("");
  return card(L("Start here","ابدأ من هنا"),`<div class="start">
   <div class="start-form"><div class="form-grid three"><label class="fld"><span>${esc("Company name")}</span><input data-hs="company" value="${esc(s.company)}"></label>
    <label class="fld"><span>${esc("VAT registration number")}</span><input data-hs="vat" class="num" inputmode="numeric" maxlength="15" value="${esc(s.vat)}"><small id="hsVat">${s.vat?(vatOk(s.vat)?pill("ok","Valid format"):pill("bad","Invalid format")):""}</small></label>
    <label class="fld"><span>${esc("Start of the year under inspection")}</span><input type="date" data-hs="fy" value="${esc(s.fy)}"></label></div>
    <div class="fld"><span>${esc(L("How do you file your VAT returns?","كيف تقدّم إقراراتك الضريبية؟"))}</span><div class="seg" role="group">${seg}</div></div>
    <div class="periods">${C.ps.map(p=>`<span class="per"><b>${esc(p.label)}</b><small><span>${esc(L("due","الاستحقاق"))}</span> <span>${esc(showDate(p.due))}</span></small></span>`).join("")}</div></div>
   <div class="start-steps"><div class="row"><b>${esc(L(`${done} of ${steps.length} ready`,`${done} من ${steps.length} جاهزة`))}</b></div><div class="meter"><span style="width:${Math.round(100*done/steps.length)}%"></span></div>
    <ol class="checks">${steps.map(([t,ok,g])=>`<li class="${ok?"ok":""}"><span class="st ${ok?"pass":"na"}">${icon(ok?"check":"dot")}</span><button class="link" data-go="${g}">${esc(t)}</button></li>`).join("")}</ol></div></div>`,"","start-card")}
const _hubR=R.hub, _hubA=AFTER.hub;
R.hub=C=>startHere(C)+_hubR(C);
AFTER.hub=C=>{_hubA(C);
  document.querySelectorAll("[data-hs]").forEach(el=>{el.addEventListener("input",()=>{S.setup[el.dataset.hs]=el.value;save();if(el.dataset.hs==="vat")$("#hsVat").innerHTML=vatOk(el.value)?pill("ok","Valid format"):pill("bad","Invalid format")});el.addEventListener("change",()=>{S.setup[el.dataset.hs]=el.value;save();render()})});
  document.querySelectorAll("[data-freq]").forEach(b=>b.onclick=()=>{const f=b.dataset.freq;if(f===S.setup.freq)return;
    const n=S.returns.filter(r=>r.filed||String(r.b16).trim()||BOX_IDS.some(x=>String(r.b[x].a).trim()||String(r.b[x].v).trim())).length;
    const apply=()=>{S.setup.freq=f;UI.ret.p=0;save();render();toast(f==="Quarterly"?L("Quarterly filing: 4 return periods","إقرار ربع سنوي: 4 فترات"):L("Monthly filing: 12 return periods","إقرار شهري: 12 فترة"))};
    n?confirmBox(L(`You have already entered ${n} return(s). Switching changes how periods are numbered, so check the VAT returns page afterwards.`,`لقد أدخلت ${n} إقراراً بالفعل. التبديل يغيّر ترقيم الفترات، لذا راجع صفحة الإقرارات بعد ذلك.`),L("Switch","تبديل"),apply):apply()})};
