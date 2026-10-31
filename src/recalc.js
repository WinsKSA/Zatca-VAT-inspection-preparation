// ================================================================ VAT return rebuilt from the registers, beside the return filed with ZATCA
// Boxes 1-5 come from the sales register by VAT category, boxes 7-11 from the purchase register.
// Output VAT = boxes 1, 2 and 9 (reverse charge); input VAT = boxes 7, 8, 9 (and 10, 11 at zero).
// Box 14 (corrections) and box 15 (credit carried forward) cannot be derived from invoices, so the filed values are used.
VIEWS.splice(VIEWS.findIndex(v=>v.id==="ret")+1,0,{id:"rcalc",t:L("Return from the data","الإقرار المحتسب من البيانات"),i:"scale"});
UI.rcalc=UI.rcalc||{p:-1};
function recalcPeriods(C){
  const rate=C.c.rate;
  return C.ps.map((p,i)=>{
    const box={};BOX_IDS.forEach(b=>box[b]={a:0,v:0});
    S.sales.forEach((r,k)=>{const x=C.sales[k];if(!x||x.p!==p.no)return;const j=SALES_CATS.indexOf(r.cat);if(j<0||j>4)return;const b=j+1;box[b].a+=x.net;if(b===1||b===2)box[b].v+=x.vat});
    S.purchases.forEach((r,k)=>{const x=C.pur[k];if(!x||x.p!==p.no)return;const j=PUR_CATS.indexOf(r.cat);if(j<0||j>4)return;const b=[7,8,9,10,11][j];box[b].a+=x.net;
      if(b===7||b===8)box[b].v+=x.vat;if(b===9)box[b].v+=x.vat?x.vat:r2(x.net*rate)});
    BOX_IDS.forEach(b=>{box[b].a=r2(box[b].a);box[b].v=r2(box[b].v)});
    const R=C.rets[i],out=r2(box[1].v+box[2].v+box[9].v),inp=r2(box[7].v+box[8].v+box[9].v),net=r2(out-inp),b16=r2(net+R.b14-R.b15);
    const box6=r2([1,2,3,4,5].reduce((s,b)=>s+box[b].a,0)),box12=r2([7,8,9,10,11].reduce((s,b)=>s+box[b].a,0));
    return{p,i,box,box6,box12,out,inp,net,b16,R};
  });
}
function rcSum(list){
  const t={box:{},box6:0,box12:0,out:0,inp:0,net:0,b16:0,R:{n:b=>0,v:b=>0,box6:0,box12:0,out:0,inp:0,box13:0,b14:0,b15:0,b16:0}};
  BOX_IDS.forEach(b=>t.box[b]={a:0,v:0});const fn={},fv={};BOX_IDS.forEach(b=>{fn[b]=0;fv[b]=0});
  list.forEach(x=>{BOX_IDS.forEach(b=>{t.box[b].a+=x.box[b].a;t.box[b].v+=x.box[b].v;fn[b]+=x.R.n(b);fv[b]+=x.R.v(b)});
    ["box6","box12","out","inp","net","b16"].forEach(k=>t[k]+=x[k]);["box6","box12","out","inp","box13","b14","b15","b16"].forEach(k=>t.R[k]+=x.R[k])});
  t.R.n=b=>fn[b];t.R.v=b=>fv[b];return t;
}
R.rcalc=C=>{
  const all=recalcPeriods(C),k=UI.rcalc.p,sel=k<0?rcSum(all):all[Math.min(k,all.length-1)],tol=C.c.tol,R=sel.R;
  const chip=(lab,i,st)=>`<button class="chip" data-rcp="${i}" aria-pressed="${i===k}"><i class="dotc ${st}"></i>${esc(lab)}</button>`;
  const stOf=x=>!x.R.entered&&!x.box6&&!x.box12?"none":Math.abs(x.b16-x.R.b16)>tol?"bad":"ok";
  const diffCell=(a,b)=>{const d=r2(a-b);return `<td class="n ${Math.abs(d)>tol?"rc-bad":"rc-ok"}">${Math.abs(d)>tol?fmt(d):"✓"}</td>`};
  const row=(no,name,ca,fa,cv,fv,cls="")=>`<tr class="${cls}"><td class="boxno">${no}</td><td>${esc(name)}</td><td class="n">${fmt(ca)}</td><td class="n">${fmt(fa)}</td>${diffCell(ca,fa)}<td class="n">${cv==null?"":fmt(cv)}</td><td class="n">${fv==null?"":fmt(fv)}</td>${cv==null?"<td></td>":diffCell(cv,fv)}</tr>`;
  const B=b=>BOXES.find(x=>x.b===b),nm=b=>LANG==="ar"?B(b).ar:B(b).en;
  const body=[1,2,3,4,5].map(b=>row(L(`Box ${b}`,`خانة ${b}`),nm(b),sel.box[b].a,R.n(b),sel.box[b].v,R.v(b))).join("")
    +row(L("Box 6","خانة 6"),L("Total sales","إجمالي المبيعات"),sel.box6,R.box6,sel.out,R.out,"total")
    +[7,8,9,10,11].map(b=>row(L(`Box ${b}`,`خانة ${b}`),nm(b),sel.box[b].a,R.n(b),sel.box[b].v,R.v(b))).join("")
    +row(L("Box 12","خانة 12"),L("Total purchases","إجمالي المشتريات"),sel.box12,R.box12,sel.inp,R.inp,"total")
    +`<tr class="total"><td class="boxno">${esc(L("Box 13","خانة 13"))}</td><td>${esc(L("Net VAT due for the period","صافي الضريبة المستحقة عن الفترة"))}</td><td colspan="3"></td><td class="n">${fmt(sel.net)}</td><td class="n">${fmt(R.box13)}</td>${diffCell(sel.net,R.box13)}</tr>
     <tr><td class="boxno">${esc(L("Box 14","خانة 14"))}</td><td>${esc(L("Corrections from previous periods (as filed)","تصحيحات الفترات السابقة (كما في الإقرار)"))}</td><td colspan="3"></td><td class="n">${fmt(R.b14)}</td><td class="n">${fmt(R.b14)}</td><td></td></tr>
     <tr><td class="boxno">${esc(L("Box 15","خانة 15"))}</td><td>${esc(L("VAT credit carried forward (as filed)","الرصيد الدائن المرحل (كما في الإقرار)"))}</td><td colspan="3"></td><td class="n">${fmt(R.b15)}</td><td class="n">${fmt(R.b15)}</td><td></td></tr>
     <tr class="total rc-net"><td class="boxno">${esc(L("Box 16","خانة 16"))}</td><td><b>${esc(L("Net VAT payable / (refundable)","صافي الضريبة المستحقة / (القابلة للاسترداد)"))}</b></td><td colspan="3"></td><td class="n"><b>${fmt(sel.b16)}</b></td><td class="n"><b>${fmt(R.b16)}</b></td>${diffCell(sel.b16,R.b16)}</tr>`;
  const dNet=r2(sel.b16-R.b16),dOut=r2(sel.out-R.out),dInp=r2(sel.inp-R.inp);
  const tile=(lab,v,sub,cls)=>`<div class="tile hero ${cls}"><span class="t-lab">${esc(lab)}</span><span class="t-val big num"><span data-count="${Math.round(v)}">${fmt0(v)}</span><small> SAR</small></span><span class="t-sub">${sub}</span></div>`;
  const say=(d,pos,neg)=>Math.abs(d)<=tol?pill("ok",L("Agrees with the return","مطابق للإقرار")):pill(d>0?"bad":"warn",d>0?pos:neg);
  const chartRows=all.filter(x=>x.R.entered||x.box6||x.box12);
  return `<p class="lead">${esc(L("This is the VAT return as it should be, rebuilt box by box from the sales and purchase registers you entered, side by side with the return you filed with ZATCA. Any difference is what an inspector would ask you to explain.","هذا هو الإقرار الضريبي كما يجب أن يكون، محتسباً خانةً خانة من سجلي المبيعات والمشتريات المدخلين، بجانب الإقرار المقدم إلى الهيئة. أي فرق هو ما سيطلب المفتش تفسيره."))}</p>
   <div class="chips">${chip(L("Whole year","السنة كاملة"),-1,all.some(x=>stOf(x)==="bad")?"bad":"ok")}${all.map((x,i)=>chip(x.p.label,i,stOf(x))).join("")}</div>
   <div class="tiles">
    ${tile(L("Net VAT difference (box 16)","فرق صافي الضريبة (خانة 16)"),dNet,say(dNet,L("Under-declared to ZATCA","أقل من المستحق في الإقرار"),L("Over-declared to ZATCA","أكثر من المستحق في الإقرار")),Math.abs(dNet)>tol?(dNet>0?"bad":"warn"):"ok")}
    ${tile(L("Output VAT difference","فرق ضريبة المخرجات"),dOut,say(dOut,L("Registers show more output VAT","السجلات تظهر ضريبة مخرجات أكثر"),L("Return shows more output VAT","الإقرار يظهر ضريبة مخرجات أكثر")),Math.abs(dOut)>tol?"warn":"ok")}
    ${tile(L("Input VAT difference","فرق ضريبة المدخلات"),dInp,say(-dInp,L("Return claims more input VAT","الإقرار يخصم ضريبة مدخلات أكثر"),L("Registers support more input VAT","السجلات تدعم ضريبة مدخلات أكثر")),Math.abs(dInp)>tol?"warn":"ok")}
    ${tile(L("Net VAT from the data","صافي الضريبة من البيانات"),sel.b16,`<span>${esc(L("Filed","المقدم"))}</span><b class="num">${fmt(R.b16)}</b>`,"")}
   </div>
   ${card(k<0?L("Whole year: computed vs filed","السنة كاملة: المحتسب مقابل المقدم"):L(`${tr(sel.p.label)}: computed vs filed`,`${tr(sel.p.label)}: المحتسب مقابل المقدم`),`<div class="frame"><table class="tbl rc-tbl" id="t-rcalc"><thead>
     <tr><th rowspan="2"></th><th rowspan="2">${esc(L("Description","البيان"))}</th><th class="n rc-g" colspan="3">${esc(L("Amount (SAR)","المبلغ (ريال)"))}</th><th class="n rc-g" colspan="3">${esc(L("VAT (SAR)","الضريبة (ريال)"))}</th></tr>
     <tr><th class="n">${esc(L("From the data","من البيانات"))}</th><th class="n">${esc(L("Filed with ZATCA","المقدم للهيئة"))}</th><th class="n">${esc(L("Difference","الفرق"))}</th><th class="n">${esc(L("From the data","من البيانات"))}</th><th class="n">${esc(L("Filed with ZATCA","المقدم للهيئة"))}</th><th class="n">${esc(L("Difference","الفرق"))}</th></tr></thead><tbody>${body}</tbody></table></div>
     <p class="note">${esc(L("Difference = from the data − filed. A positive VAT difference means the registers show more tax than was declared. Box 14 and box 15 are taken from the filed return. Amounts include credit notes as negatives.","الفرق = من البيانات − المقدم. الفرق الموجب في الضريبة يعني أن السجلات تظهر ضريبة أكثر مما تم الإقرار به. الخانتان 14 و15 مأخوذتان من الإقرار المقدم. تُحتسب الإشعارات الدائنة بالسالب."))}</p>`,
     `<button class="btn sm" id="rcCopy">${esc(L("Copy table","نسخ الجدول"))}</button>`)}
   ${card(L("Net VAT by period: from the data vs filed","صافي الضريبة لكل فترة: من البيانات مقابل المقدم"),chartRows.length?columnChart(chartRows.map(x=>x.p.short),[{name:L("From the data","من البيانات"),c:"s2",values:chartRows.map(x=>x.b16)},{name:L("Filed with ZATCA","المقدم للهيئة"),c:"s1",values:chartRows.map(x=>x.R.b16)}]):`<p class="empty">${esc(L("No data yet","لا توجد بيانات بعد"))}</p>`)}
   ${card(L("Every period at a glance","كل الفترات بنظرة واحدة"),`<div class="frame"><table class="tbl"><thead><tr><th>${esc(L("Period","الفترة"))}</th><th class="n">${esc(L("Sales (data)","المبيعات (البيانات)"))}</th><th class="n">${esc(L("Sales (filed)","المبيعات (المقدم)"))}</th><th class="n">${esc(L("Output VAT (data)","ضريبة المخرجات (البيانات)"))}</th><th class="n">${esc(L("Output VAT (filed)","ضريبة المخرجات (المقدم)"))}</th><th class="n">${esc(L("Input VAT (data)","ضريبة المدخلات (البيانات)"))}</th><th class="n">${esc(L("Input VAT (filed)","ضريبة المدخلات (المقدم)"))}</th><th class="n">${esc(L("Net (data)","الصافي (البيانات)"))}</th><th class="n">${esc(L("Net (filed)","الصافي (المقدم)"))}</th><th class="n">${esc(L("Difference","الفرق"))}</th></tr></thead><tbody>
     ${all.map(x=>`<tr><td><button class="link" data-rcp="${x.i}">${esc(x.p.label)}</button></td><td class="n">${fmt(x.box6)}</td><td class="n">${fmt(x.R.box6)}</td><td class="n">${fmt(x.out)}</td><td class="n">${fmt(x.R.out)}</td><td class="n">${fmt(x.inp)}</td><td class="n">${fmt(x.R.inp)}</td><td class="n">${fmt(x.b16)}</td><td class="n">${fmt(x.R.b16)}</td>${diffCell(x.b16,x.R.b16)}</tr>`).join("")}</tbody>
     <tfoot>${(()=>{const t=rcSum(all);return `<tr class="total"><td><b>${esc(L("Total","الإجمالي"))}</b></td><td class="n">${fmt(t.box6)}</td><td class="n">${fmt(t.R.box6)}</td><td class="n">${fmt(t.out)}</td><td class="n">${fmt(t.R.out)}</td><td class="n">${fmt(t.inp)}</td><td class="n">${fmt(t.R.inp)}</td><td class="n">${fmt(t.b16)}</td><td class="n">${fmt(t.R.b16)}</td>${diffCell(t.b16,t.R.b16)}</tr>`})()}</tfoot></table></div>`)}`;
};
AFTER.rcalc=()=>{
  document.querySelectorAll("[data-rcp]").forEach(b=>b.onclick=()=>{UI.rcalc.p=+b.dataset.rcp;render()});
  const cp=$("#rcCopy");if(cp)cp.onclick=()=>copyText(tableTSV(document.getElementById("t-rcalc")));
};
