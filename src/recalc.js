// ================================================================ VAT return rebuilt from the registers, laid out like the ZATCA VAT return form
// Same structure as the form filed on the ZATCA portal: boxes 1-16, each with Amount, Adjustments and VAT amount.
// Sales boxes 1-5 come from the sales register by VAT category; credit and debit notes go to Adjustments.
// Purchase boxes 7-11 come from the purchase register; negative lines (supplier credit notes) go to Adjustments.
// Output VAT = boxes 1, 2 and 9 (reverse charge); input VAT = boxes 7, 8 and 9.
// Box 14 (corrections of earlier periods) and box 15 (credit carried forward) cannot be derived from invoices: the filed values are used.
VIEWS.splice(VIEWS.findIndex(v=>v.id==="ret")+1,0,{id:"rcalc",t:L("Return from the data","الإقرار المحتسب من البيانات"),i:"scale"});
UI.rcalc=UI.rcalc||{p:-1,view:"cmp"};
const NOTE_TYPES=["Credit Note","Debit Note"];
function recalcPeriods(C){
  const rate=C.c.rate;
  return C.ps.map((p,i)=>{
    const box={};BOX_IDS.forEach(b=>box[b]={a:0,j:0,v:0,n:0});
    S.sales.forEach((r,k)=>{const x=C.sales[k];if(!x||x.p!==p.no)return;const j=SALES_CATS.indexOf(r.cat);if(j<0||j>4)return;const b=j+1,t=box[b];
      if(NOTE_TYPES.includes(r.type))t.j+=x.net;else t.a+=x.net;if(b===1||b===2)t.v+=x.vat;t.n++});
    S.purchases.forEach((r,k)=>{const x=C.pur[k];if(!x||x.p!==p.no)return;const j=PUR_CATS.indexOf(r.cat);if(j<0||j>4)return;const b=[7,8,9,10,11][j],t=box[b];
      if(x.net<0)t.j+=x.net;else t.a+=x.net;if(b===7||b===8)t.v+=x.vat;if(b===9)t.v+=x.vat?x.vat:r2(x.net*rate);t.n++});
    BOX_IDS.forEach(b=>{const t=box[b];t.a=r2(t.a);t.j=r2(t.j);t.v=r2(t.v)});
    const R=C.rets[i],tot=bs=>bs.reduce((s,b)=>s+box[b].a+box[b].j,0);
    const out=r2(box[1].v+box[2].v+box[9].v),inp=r2(box[7].v+box[8].v+box[9].v),net=r2(out-inp);
    return{p,i,box,box6:r2(tot([1,2,3,4,5])),box12:r2(tot([7,8,9,10,11])),out,inp,net,b16:r2(net+R.b14-R.b15),R};
  });
}
// filed values per box, split into amount / adjustment / VAT like the form
const filedBox=(R,ret,b)=>({a:num(ret.b[b].a),j:num(ret.b[b].j),v:num(ret.b[b].v)});
function rcSum(list){
  const t={box:{},fb:{},box6:0,box12:0,out:0,inp:0,net:0,b16:0,R:{box6:0,box12:0,out:0,inp:0,box13:0,b14:0,b15:0,b16:0}};
  BOX_IDS.forEach(b=>{t.box[b]={a:0,j:0,v:0,n:0};t.fb[b]={a:0,j:0,v:0}});
  list.forEach(x=>{const ret=S.returns[x.p.i];BOX_IDS.forEach(b=>{["a","j","v","n"].forEach(f=>t.box[b][f]+=x.box[b][f]);const f=filedBox(x.R,ret,b);t.fb[b].a+=f.a;t.fb[b].j+=f.j;t.fb[b].v+=f.v});
    ["box6","box12","out","inp","net","b16"].forEach(k=>t[k]+=x[k]);["box6","box12","out","inp","box13","b14","b15","b16"].forEach(k=>t.R[k]+=x.R[k])});
  return t;
}
function rcView(all,k){
  if(k>=0){const x=all[Math.min(k,all.length-1)],ret=S.returns[x.p.i],fb={};BOX_IDS.forEach(b=>fb[b]=filedBox(x.R,ret,b));return{...x,fb,label:x.p.label,period:x.p}}
  return{...rcSum(all),label:L("Whole year","السنة كاملة"),period:null};
}
// variance waterfall: filed net VAT -> output VAT difference -> input VAT difference -> net VAT from the data
function waterfall(v){
  const steps=[{l:L("Filed with ZATCA","المقدم للهيئة"),v:v.R.b16,t:"base"},{l:L("Output VAT difference","فرق ضريبة المخرجات"),v:r2(v.out-v.R.out),t:"d"},
    {l:L("Input VAT difference","فرق ضريبة المدخلات"),v:r2(-(v.inp-v.R.inp)),t:"d"},{l:L("From the data","من البيانات"),v:v.b16,t:"base"}];
  let run=0;const pts=steps.map(s=>{let a,b;if(s.t==="base"){a=0;b=s.v;run=s.v}else{a=run;b=run+s.v;run=b}return{...s,lo:Math.min(a,b),hi:Math.max(a,b)}});
  const mn=Math.min(0,...pts.map(p=>p.lo)),mx=Math.max(1,...pts.map(p=>p.hi)),span=mx-mn||1,pc=x=>((x-mn)/span*100).toFixed(2);
  return `<div class="wf">${pts.map((p,i)=>`<div class="wf-row" style="--d:${(i*.12).toFixed(2)}s"><span class="wf-l">${esc(p.l)}</span><div class="wf-track"><i class="wf-zero" style="inset-inline-start:${pc(0)}%"></i><b class="wf-bar ${p.t==="base"?"base":p.v>0?"up":p.v<0?"down":"flat"}" style="inset-inline-start:${pc(p.lo)}%;width:${Math.max(.6,(p.hi-p.lo)/span*100).toFixed(2)}%"></b></div><span class="wf-v num ${p.t!=="base"&&Math.abs(p.v)>0.005?(p.v>0?"up":"down"):""}">${p.t!=="base"&&p.v>0?"+":""}${fmt(p.v)}</span></div>`).join("")}</div>
   <p class="note">${esc(L("Read it top to bottom: what you filed, plus the output VAT the registers add, minus the input VAT they do not support, equals the net VAT the data supports.","اقرأه من الأعلى إلى الأسفل: ما قدمته، مضافاً إليه ضريبة المخرجات التي تضيفها السجلات، ناقصاً ضريبة المدخلات التي لا تدعمها، يساوي صافي الضريبة الذي تدعمه البيانات."))}</p>`;
}
R.rcalc=C=>{
  const all=recalcPeriods(C),k=UI.rcalc.p,mode=UI.rcalc.view||"cmp",v=rcView(all,k),tol=C.c.tol,R=v.R;
  const stOf=x=>!x.R.entered&&!x.box6&&!x.box12?"none":Math.abs(x.b16-x.R.b16)>tol?"bad":"ok";
  const chip=(lab,i,st)=>`<button class="chip" data-rcp="${i}" aria-pressed="${i===k}"><i class="dotc ${st}"></i>${esc(lab)}</button>`;
  const seg=(id,lab)=>`<button type="button" data-rcv="${id}" aria-pressed="${mode===id}">${esc(lab)}</button>`;
  // one form cell: the computed value, the filed value under it, and the difference
  const cell=(c,f,show=true)=>{if(!show)return `<td class="zf-c zf-na"></td>`;const d=r2(c-f),bad=Math.abs(d)>tol;
    if(mode==="calc")return `<td class="zf-c"><b class="num">${fmt(c)}</b></td>`;
    if(mode==="filed")return `<td class="zf-c"><b class="num">${fmt(f)}</b></td>`;
    return `<td class="zf-c${bad?" bad":""}"><b class="num">${fmt(c)}</b><small><span>${esc(L("Filed","المقدم"))}</span> <span class="num">${fmt(f)}</span></small>${bad?`<em class="num">${d>0?"+":""}${fmt(d)}</em>`:`<em class="ok">✓</em>`}</td>`};
  const B=b=>BOXES.find(x=>x.b===b),nm=b=>LANG==="ar"?B(b).ar:B(b).en;
  const line=(b,vat=true)=>`<tr><td class="zf-no"><span>${b}</span></td><td class="zf-d">${esc(nm(b))}${v.box[b].n?`<small>${esc(L(`${v.box[b].n} invoices`,`${v.box[b].n} فاتورة`))}</small>`:""}</td>${cell(v.box[b].a,v.fb[b].a)}${cell(v.box[b].j,v.fb[b].j)}${cell(v.box[b].v,v.fb[b].v,vat)}</tr>`;
  const totRow=(no,name,ca,fa,cv,fv)=>`<tr class="zf-tot"><td class="zf-no"><span>${no}</span></td><td class="zf-d"><b>${esc(name)}</b></td>${cell(ca,fa)}<td class="zf-c zf-na"></td>${cell(cv,fv)}</tr>`;
  const sumRow=(no,name,c,f,strong,derived=true)=>`<tr class="zf-sum${strong?" strong":""}"><td class="zf-no"><span>${no}</span></td><td class="zf-d" colspan="3">${strong?`<b>${esc(name)}</b>`:esc(name)}${derived?"":`<small>${esc(L("Taken from the filed return","مأخوذة من الإقرار المقدم"))}</small>`}</td>${cell(c,f)}</tr>`;
  const head=`<tr><th class="zf-no">${esc(L("Box","الخانة"))}</th><th class="zf-d"></th><th class="zf-c">${esc(L("Amount (SAR)","المبلغ (ريال)"))}</th><th class="zf-c">${esc(L("Adjustments (SAR)","التعديلات (ريال)"))}</th><th class="zf-c">${esc(L("VAT amount (SAR)","مبلغ ضريبة القيمة المضافة (ريال)"))}</th></tr>`;
  const dNet=r2(v.b16-R.b16),dOut=r2(v.out-R.out),dInp=r2(v.inp-R.inp);
  const verdict=Math.abs(dNet)<=tol?["ok",L("The data supports the return as filed.","البيانات تدعم الإقرار كما تم تقديمه.")]:dNet>0?["bad",L(`The registers show ${fmt(dNet)} SAR more net VAT than was declared. Expect ZATCA to assess it, plus penalties.`,`تُظهر السجلات صافي ضريبة أعلى بمبلغ ${fmt(dNet)} ريال مما تم الإقرار به. يُتوقع أن تقدّره الهيئة مع الغرامات.`)]:["warn",L(`The registers show ${fmt(-dNet)} SAR less net VAT than was declared. You may have overpaid; check before claiming a correction.`,`تُظهر السجلات صافي ضريبة أقل بمبلغ ${fmt(-dNet)} ريال مما تم الإقرار به. قد تكون سددت بالزيادة؛ تحقق قبل طلب التصحيح.`)];
  const per=v.period,co=S.setup;
  return `<p class="lead">${esc(L("The VAT return as your data says it should be, laid out exactly like the ZATCA return form, with what you filed under every figure. Any difference is what an inspector will ask you to explain.","الإقرار الضريبي كما تقول بياناتك إنه يجب أن يكون، بنفس ترتيب نموذج إقرار الهيئة، وتحت كل رقم ما قمت بتقديمه. أي فرق هو ما سيطلب المفتش تفسيره."))}</p>
   <div class="rc-bar"><div class="chips">${chip(L("Whole year","السنة كاملة"),-1,all.some(x=>stOf(x)==="bad")?"bad":"ok")}${all.map((x,i)=>chip(x.p.label,i,stOf(x))).join("")}</div>
    <div class="seg how rc-seg" role="radiogroup" aria-label="${esc(L("Show","العرض"))}">${seg("cmp",L("Compare","مقارنة"))}${seg("calc",L("From the data","من البيانات"))}${seg("filed",L("As filed","كما قُدّم"))}</div></div>
   <div class="rc-verdict ${verdict[0]}">${icon(verdict[0]==="ok"?"check":"alert")}<span>${esc(verdict[1])}</span></div>
   <div class="tiles">
    <div class="tile hero ${Math.abs(dNet)>tol?(dNet>0?"bad":"warn"):"ok"}"><span class="t-lab">${esc(L("Net VAT difference (box 16)","فرق صافي الضريبة (خانة 16)"))}</span><span class="t-val big num">${dNet>0?"+":""}<span data-count="${Math.round(dNet)}">${fmt0(dNet)}</span><small> SAR</small></span><span class="t-sub"><span>${esc(L("From the data","من البيانات"))}</span><b class="num">${fmt(v.b16)}</b><span>·</span><span>${esc(L("Filed","المقدم"))}</span><b class="num">${fmt(R.b16)}</b></span></div>
    <div class="tile hero ${Math.abs(dOut)>tol?"warn":"ok"}"><span class="t-lab">${esc(L("Output VAT difference","فرق ضريبة المخرجات"))}</span><span class="t-val big num">${dOut>0?"+":""}${fmt0(dOut)}<small> SAR</small></span><span class="t-sub"><span>${esc(L("Boxes 1, 2 and 9","الخانات 1 و2 و9"))}</span></span></div>
    <div class="tile hero ${Math.abs(dInp)>tol?"warn":"ok"}"><span class="t-lab">${esc(L("Input VAT difference","فرق ضريبة المدخلات"))}</span><span class="t-val big num">${dInp>0?"+":""}${fmt0(dInp)}<small> SAR</small></span><span class="t-sub"><span>${esc(L("Boxes 7, 8 and 9","الخانات 7 و8 و9"))}</span></span></div>
    <div class="tile hero"><span class="t-lab">${esc(L("Periods that do not agree","الفترات غير المطابقة"))}</span><span class="t-val big num"><span data-count="${all.filter(x=>stOf(x)==="bad").length}">${all.filter(x=>stOf(x)==="bad").length}</span><small> / ${all.length}</small></span><span class="t-sub"><span>${esc(L(`Tolerance SAR ${fmt(tol)}`,`حد التقريب ${fmt(tol)} ريال`))}</span></span></div>
   </div>
   <section class="card zf">
    <header class="zf-h"><div><span class="zf-k">${esc(L("VAT return · rebuilt from your data","إقرار ضريبة القيمة المضافة · محتسب من بياناتك"))}</span><h2>${esc(per?L(`Tax period: ${tr(per.label)}`,`الفترة الضريبية: ${tr(per.label)}`):L("Whole year (all periods)","السنة كاملة (جميع الفترات)"))}</h2></div>
     <dl><div><dt>${esc(L("Taxpayer","المكلف"))}</dt><dd data-notr>${esc(co.company||"—")}</dd></div><div><dt>${esc(L("VAT number","الرقم الضريبي"))}</dt><dd class="num">${esc(co.vat||"—")}</dd></div>
      ${per?`<div><dt>${esc(L("Period","الفترة"))}</dt><dd class="num" dir="ltr">${esc(showDate(per.st))} – ${esc(showDate(per.en))}</dd></div><div><dt>${esc(L("Due date","تاريخ الاستحقاق"))}</dt><dd class="num" dir="ltr">${esc(showDate(per.due))}</dd></div>`:""}</dl>
     <button class="btn sm" id="rcCopy">${esc(L("Copy","نسخ"))}</button></header>
    <div class="frame"><table class="zf-t" id="t-rcalc">
     <tbody class="zf-sec"><tr class="zf-cap"><th colspan="5">${esc(L("VAT on sales","ضريبة القيمة المضافة على المبيعات"))}</th></tr>${head}${[1,2,3,4,5].map(b=>line(b,b<=2)).join("")}${totRow(6,L("Total sales","إجمالي المبيعات"),v.box6,R.box6,v.out,R.out)}</tbody>
     <tbody class="zf-sec"><tr class="zf-cap"><th colspan="5">${esc(L("VAT on purchases","ضريبة القيمة المضافة على المشتريات"))}</th></tr>${head}${[7,8,9,10,11].map(b=>line(b,b<=9)).join("")}${totRow(12,L("Total purchases","إجمالي المشتريات"),v.box12,R.box12,v.inp,R.inp)}</tbody>
     <tbody class="zf-sec"><tr class="zf-cap"><th colspan="5">${esc(L("Net VAT","صافي الضريبة"))}</th></tr>
      ${sumRow(13,L("Total VAT due for the current period","إجمالي ضريبة القيمة المضافة المستحقة عن الفترة الحالية"),v.net,R.box13)}
      ${sumRow(14,L("Corrections from previous periods (between ±5,000 SAR)","تصحيحات من الفترات السابقة (بين ±5,000 ريال)"),R.b14,R.b14,false,false)}
      ${sumRow(15,L("VAT credit carried forward from previous periods","ضريبة القيمة المضافة المرحلة من الفترات السابقة"),R.b15,R.b15,false,false)}
      ${sumRow(16,L("Net VAT due (or claimed)","صافي ضريبة القيمة المضافة المستحقة (أو المستردة)"),v.b16,R.b16,true)}</tbody>
    </table></div>
    <p class="note">${esc(L("Difference = from the data − filed. Credit and debit notes are shown in Adjustments. Box 2 VAT is borne by the State. Box 14 and box 15 are taken from the filed return.","الفرق = من البيانات − المقدم. تظهر الإشعارات الدائنة والمدينة في عمود التعديلات. ضريبة الخانة 2 تتحملها الدولة. الخانتان 14 و15 مأخوذتان من الإقرار المقدم."))}</p>
   </section>
   <div class="grid2">
    ${card(L("How the difference builds up","كيف يتكوّن الفرق"),waterfall(v))}
    ${(()=>{const rows=all.filter(x=>x.R.entered||x.box6||x.box12);return card(L("Net VAT by period: from the data vs filed","صافي الضريبة لكل فترة: من البيانات مقابل المقدم"),rows.length?columnChart(rows.map(x=>x.p.short),[{name:L("From the data","من البيانات"),c:"s2",values:rows.map(x=>x.b16)},{name:L("Filed with ZATCA","المقدم للهيئة"),c:"s1",values:rows.map(x=>x.R.b16)}]):`<p class="empty">${esc(L("No data yet","لا توجد بيانات بعد"))}</p>`)})()}
   </div>
   ${card(L("Every period at a glance","كل الفترات بنظرة واحدة"),`<div class="frame"><table class="tbl"><thead><tr><th>${esc(L("Period","الفترة"))}</th><th class="n">${esc(L("Sales (data)","المبيعات (البيانات)"))}</th><th class="n">${esc(L("Sales (filed)","المبيعات (المقدم)"))}</th><th class="n">${esc(L("Output VAT (data)","ضريبة المخرجات (البيانات)"))}</th><th class="n">${esc(L("Output VAT (filed)","ضريبة المخرجات (المقدم)"))}</th><th class="n">${esc(L("Input VAT (data)","ضريبة المدخلات (البيانات)"))}</th><th class="n">${esc(L("Input VAT (filed)","ضريبة المدخلات (المقدم)"))}</th><th class="n">${esc(L("Net (data)","الصافي (البيانات)"))}</th><th class="n">${esc(L("Net (filed)","الصافي (المقدم)"))}</th><th class="n">${esc(L("Difference","الفرق"))}</th></tr></thead><tbody>
     ${all.map(x=>{const d=r2(x.b16-x.R.b16);return `<tr><td><button class="link" data-rcp="${x.i}">${esc(x.p.label)}</button></td><td class="n">${fmt(x.box6)}</td><td class="n">${fmt(x.R.box6)}</td><td class="n">${fmt(x.out)}</td><td class="n">${fmt(x.R.out)}</td><td class="n">${fmt(x.inp)}</td><td class="n">${fmt(x.R.inp)}</td><td class="n">${fmt(x.b16)}</td><td class="n">${fmt(x.R.b16)}</td><td class="n ${Math.abs(d)>tol?"rc-bad":"rc-ok"}">${Math.abs(d)>tol?fmt(d):"✓"}</td></tr>`}).join("")}</tbody>
     <tfoot>${(()=>{const t=rcSum(all),d=r2(t.b16-t.R.b16);return `<tr class="total"><td><b>${esc(L("Total","الإجمالي"))}</b></td><td class="n">${fmt(t.box6)}</td><td class="n">${fmt(t.R.box6)}</td><td class="n">${fmt(t.out)}</td><td class="n">${fmt(t.R.out)}</td><td class="n">${fmt(t.inp)}</td><td class="n">${fmt(t.R.inp)}</td><td class="n">${fmt(t.b16)}</td><td class="n">${fmt(t.R.b16)}</td><td class="n ${Math.abs(d)>tol?"rc-bad":"rc-ok"}">${Math.abs(d)>tol?fmt(d):"✓"}</td></tr>`})()}</tfoot></table></div>`)}`;
};
AFTER.rcalc=()=>{
  document.querySelectorAll("[data-rcp]").forEach(b=>b.onclick=()=>{UI.rcalc.p=+b.dataset.rcp;render()});
  document.querySelectorAll("[data-rcv]").forEach(b=>b.onclick=()=>{UI.rcalc.view=b.dataset.rcv;render()});
  const cp=$("#rcCopy");if(cp)cp.onclick=()=>copyText(tableTSV(document.getElementById("t-rcalc")));
};
