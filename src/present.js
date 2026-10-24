// ================================================================ presentation mode: executive briefing built from live data
function deckSlides(C){
  const s=S.setup,E=C.exposure,T=C.tests,fails=T.filter(t=>t.status==="fail"),cnt=st=>T.filter(t=>t.status===st).length;
  const due=D(S.case.due),days=due?daysBetween(todayD(),due):null,rq=openReq(),openN=rq.filter(r=>r.status!=="Submitted"&&r.status!=="Closed").length;
  const noDec=fails.filter(t=>!(S.decisions[t.id]||{}).d).length;
  const sc=C.score,scCls=sc==null?"none":sc>=85?"ok":sc>=65?"warn":"bad";
  const big=(lab,val,sub="",cls="")=>`<div class="d-stat ${cls}"><span class="d-lab">${esc(lab)}</span><span class="d-val">${val}</span>${sub?`<span class="d-sub">${sub}</span>`:""}</div>`;
  const head=(eyebrow,title)=>`<div class="d-head"><span class="d-eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2></div>`;
  const top=[...fails].sort((a,b)=>b.tax-a.tax).slice(0,6);
  const actions=[];
  if(openN)actions.push(L(`Answer ${openN} open ZATCA request(s)${due?" before "+showDate(due):""}.`,`الرد على ${openN} طلب مفتوح من الهيئة${due?" قبل "+dAr(showDate(due)):""}.`));
  if(noDec)actions.push(L(`Record a decision and explanation for ${noDec} finding(s).`,`تسجيل قرار وتفسير لعدد ${noDec} ملاحظة.`));
  if(E.tax>C.c.tol&&E.active)actions.push(L(`Correct and pay SAR ${fmt0(E.tax)} before ${showDate(C.c.initEnd)} to use the fines initiative (saves SAR ${fmt0(E.waived)}).`,`تصحيح وسداد ${fmt0(E.tax)} ريال قبل ${dAr(showDate(C.c.initEnd))} للاستفادة من مبادرة الإعفاء (توفير ${fmt0(E.waived)} ريال).`));
  if(Math.abs(C.rev.unexpl)>C.c.tol)actions.push(L(`Explain the SAR ${fmt0(C.rev.unexpl)} revenue difference between the ledger and the returns.`,`تفسير فرق الإيرادات البالغ ${fmt0(C.rev.unexpl)} ريال بين الدفاتر والإقرارات.`));
  if(C.ready<1)actions.push(L(`Complete the document checklist (${Math.round(C.ready*100)}% ready).`,`استكمال قائمة المستندات (جاهزة بنسبة ${Math.round(C.ready*100)}%).`));
  if(!actions.length)actions.push(L("No open actions. The file is ready for ZATCA.","لا توجد إجراءات مفتوحة. الملف جاهز للهيئة."));
  return [
   `<div class="d-cover"><svg viewBox="0 0 40 40" class="d-logo" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="10" fill="var(--brand)"/><circle cx="18" cy="18" r="8" fill="none" stroke="#fff" stroke-width="3"/><path d="M24 24l7 7" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>
     <span class="d-eyebrow">${esc(L("VAT inspection briefing","إحاطة فحص ضريبة القيمة المضافة"))}</span><h1 data-notr>${esc(s.company||L("Your company","منشأتك"))}</h1>
     <p class="d-meta"><span class="num">${esc(s.vat||"")}</span>${S.case.notice?` · <span>${esc(S.case.notice)}</span>`:""}</p>
     <p class="d-meta"><span>${esc(L("Prepared","تاريخ الإعداد"))}</span> <span>${esc(showDate(todayD()))}</span></p></div>`,
   head(L("Readiness","الجاهزية"),L("Where we stand","أين نقف"))+`<div class="d-grid four">${big(L("Compliance score","مؤشر الالتزام"),sc==null?"–":`${sc}<small>/100</small>`,"",scCls)}${big(L("Tests passed","اختبارات ناجحة"),cnt("pass"),"","ok")}${big(L("Tests failed","اختبارات فاشلة"),cnt("fail"),"","bad")}${big(L("Documents ready","المستندات الجاهزة"),`${Math.round(C.ready*100)}%`)}</div>
     <div class="d-grid two">${big(L("Response deadline","موعد الرد"),days==null?"–":`${days<0?-days:days}<small> ${esc(days<0?L("days overdue","يوم تأخير"):L("days","يوم"))}</small>`,due?esc(showDate(due)):"",days!=null&&days<=7?"bad":"")}${big(L("ZATCA requests open","طلبات الهيئة المفتوحة"),openN,L(`of ${rq.length}`,`من ${rq.length}`))}</div>`,
   head(L("Exposure","التعرض"),L("What is at stake","ما هو المعرض للخطر"))+`<div class="d-grid two">${big(L("Without action","دون إجراء"),`${fmt0(E.A)}<small> SAR</small>`,"","bad")}${big(L("Correcting under the fines initiative","التصحيح ضمن مبادرة الإعفاء"),`${fmt0(E.B)}<small> SAR</small>`,E.active?L(`${E.daysLeft} days left`,`متبقي ${E.daysLeft} يوم`):L("Not active","غير سارية"),"ok")}</div>
     ${barList([{label:L("Under-declared output VAT","ضريبة مخرجات غير مُقر بها"),value:E.out,c:"s2"},{label:L("Over-claimed input VAT","ضريبة مدخلات مخصومة بالزيادة"),value:E.inp,c:"s2"},{label:L("Incorrect-return penalty (50%)","غرامة الإقرار الخاطئ (50%)"),value:E.pen,c:"s1"},{label:L("Late payment penalties","غرامات التأخر في السداد"),value:E.latePay,c:"s1"}])}`,
   head(L("Reconciliations","المطابقات"),L("Status by period","الحالة حسب الفترة"))+`<div class="frame"><table class="heat"><thead><tr><th>${esc("Check")}</th>${C.ps.map(p=>`<th class="c">${esc(p.short)}</th>`).join("")}</tr></thead><tbody>
     ${[[L("Sales – Box 1","المبيعات – خانة 1"),C.salesRec[0].rows],["Output VAT",C.outRec],["Input VAT",C.inRec],[L("VAT control account","حساب الضريبة"),C.vatRec]].map(([l,rs])=>`<tr><td>${esc(l)}</td>${rs.map(r=>`<td class="h"><span class="cell ${r.s}">${icon(STI[r.s])}</span></td>`).join("")}</tr>`).join("")}
     <tr><td>${esc("Filed on time")}</td>${C.rets.map(r=>`<td class="h"><span class="cell ${r.late}">${icon(STI[r.late])}</span></td>`).join("")}</tr></tbody></table></div>`,
   head(L("Findings","الملاحظات"),L("The largest issues","أكبر الملاحظات"))+(top.length?`<ol class="d-list">${top.map(t=>`<li><span class="mono">${t.id}</span><span class="d-lt">${esc(t.title)}</span>${sevPill(t.sev)}<b class="num">${fmt(t.tax)}</b></li>`).join("")}</ol>`:`<p class="d-empty">${esc(L("No findings in the data entered so far.","لا توجد ملاحظات في البيانات المدخلة حتى الآن."))}</p>`),
   head(L("ZATCA","الهيئة"),L("Requests and deadlines","الطلبات والمواعيد"))+(rq.length?`<ol class="d-list">${rq.map(r=>`<li><span class="d-lt">${esc(r.item||"—")}</span><span>${esc(showDate(r.due))}</span>${r.status==="Submitted"||r.status==="Closed"?pill("ok",L("Done","منجز")):r.overdue?pill("bad",L(`${-r.days} days overdue`,`متأخر ${-r.days} يوم`)):pill("none",L(r.status,{"Open":"مفتوح","In preparation":"قيد الإعداد"}[r.status]||r.status))}</li>`).join("")}</ol>`:`<p class="d-empty">${esc(L("No ZATCA requests recorded.","لا توجد طلبات مسجلة من الهيئة."))}</p>`),
   head(L("Next steps","الخطوات التالية"),L("Recommended actions","الإجراءات الموصى بها"))+`<ol class="d-actions">${actions.map(a=>`<li>${esc(a)}</li>`).join("")}</ol><p class="d-note">${esc(L("Estimates only. Confirm with your tax advisor before acting.","تقديرات فقط. تأكد مع مستشارك الضريبي قبل اتخاذ أي إجراء."))}</p>`];
}
function openDeck(C){
  const slides=deckSlides(C);let i=0;
  const el=document.createElement("div");el.className="deck";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label",tr(L("Presentation","العرض التقديمي")));
  el.innerHTML=`<div class="deck-stage"><section class="slide"></section></div><div class="deck-bar"><button class="btn ghost" data-d="prev" aria-label="${esc(tr(L("Previous slide","الشريحة السابقة")))}">${icon(LANG==="ar"?"next":"prev")}</button><span class="deck-n num"></span><button class="btn ghost" data-d="next" aria-label="${esc(tr(L("Next slide","الشريحة التالية")))}">${icon(LANG==="ar"?"prev":"next")}</button><span class="grow"></span><button class="btn ghost" data-d="fs">${esc(L("Full screen","ملء الشاشة"))}</button><button class="btn" data-d="close">${esc(L("Close","إغلاق"))}</button></div>`;
  document.body.appendChild(el);
  const show=k=>{i=Math.max(0,Math.min(slides.length-1,k));const sl=el.querySelector(".slide");sl.innerHTML=slides[i];sl.classList.remove("enter");void sl.offsetWidth;if(!REDUCED)sl.classList.add("enter");el.querySelector(".deck-n").textContent=`${i+1} / ${slides.length}`;
    el.querySelector('[data-d="prev"]').disabled=i===0;el.querySelector('[data-d="next"]').disabled=i===slides.length-1;if(!REDUCED&&sl.querySelector(".bl-bar"))sl.classList.add("anim")};
  const close=()=>{document.removeEventListener("keydown",key);if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});el.remove()};
  const key=e=>{const fwd=LANG==="ar"?"ArrowLeft":"ArrowRight",back=LANG==="ar"?"ArrowRight":"ArrowLeft";if(e.key===fwd||e.key===" "||e.key==="PageDown"){e.preventDefault();show(i+1)}else if(e.key===back||e.key==="PageUp"){e.preventDefault();show(i-1)}else if(e.key==="Escape")close()};
  document.addEventListener("keydown",key);
  el.addEventListener("click",e=>{const b=e.target.closest("[data-d]");if(!b)return;const d=b.dataset.d;if(d==="next")show(i+1);if(d==="prev")show(i-1);if(d==="close")close();if(d==="fs"){(document.fullscreenElement?document.exitFullscreen():el.requestFullscreen?.())?.catch?.(()=>{})}});
  show(0);el.querySelector('[data-d="next"]').focus();
}
