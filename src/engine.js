// ================================================================ engine
function cfg(){const s=S.setup;return{rate:num(s.rate)/100,tol:num(s.tol),lpp:num(s.lpp)/100,irp:num(s.irp)/100,asof:D(s.asof)||todayD(),init:s.init==="Yes",initEnd:D(s.initEnd),initCut:D(s.initCut)}}
function periods(){
  let fy=D(S.setup.fy)||D("2025-01-01"); fy=new Date(Date.UTC(fy.getUTCFullYear(),fy.getUTCMonth(),1));
  const n=S.setup.freq==="Quarterly"?4:12, mp=12/n, out=[];
  for(let i=0;i<n;i++){const st=addM(fy,i*mp), en=new Date(addM(fy,(i+1)*mp)-864e5), due=eom(addM(en,1));
    out.push({i,no:i+1,st,en,due,label:n===12?`${MON[st.getUTCMonth()]} ${st.getUTCFullYear()}`:`Q${i+1} ${st.getUTCFullYear()}`,short:n===12?MON[st.getUTCMonth()]:`Q${i+1}`,months:Array.from({length:mp},(_,k)=>i*mp+k)})}
  return out;
}
function monthLabels(){let fy=D(S.setup.fy)||D("2025-01-01");return Array.from({length:12},(_,m)=>{const d=addM(fy,m);return `${MON[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`})}
function periodOf(ps,s){const d=D(s);if(!d)return 0;const p=ps.find(p=>d>=p.st&&d<=p.en);return p?p.no:0}
function monthsLate(due,d){if(!due||!d||d<=due)return 0;return (d.getUTCFullYear()-due.getUTCFullYear())*12+d.getUTCMonth()-due.getUTCMonth()+(d.getUTCDate()>due.getUTCDate()?1:0)}
const normNo=s=>String(s||"").trim().toUpperCase().replace(/\s+/g,"");

function salesCalc(r,ps,c){
  if(!r.date&&!r.no&&!r.net)return null;
  const p=periodOf(ps,r.date), net=num(r.net), vat=num(r.vat), exp=r.cat===SALES_CATS[0]?r2(net*c.rate):0, diff=r2(vat-exp), f=[];
  if(!p)f.push("Date outside audit periods");
  if(!r.cat)f.push("No VAT category");
  if(Math.abs(diff)>c.tol)f.push("VAT ≠ 15% × net");
  if(r.ctype===CUST_TYPES[0]&&!vatOk(r.cvat))f.push("Invalid or missing customer VAT no");
  if(r.fat!=="Yes")f.push("Not reported/cleared on FATOORA");
  if((r.cat===SALES_CATS[2]||r.cat===SALES_CATS[3])&&!String(r.ev||"").trim())f.push("Zero-rate/export evidence missing");
  if(r.type==="Credit Note"&&net>0)f.push("Credit note should be negative");
  if(r.type==="Simplified Tax Invoice"&&r.ctype===CUST_TYPES[0])f.push("Simplified invoice to VAT-registered B2B");
  if(r.cat&&!SALES_CATS.includes(r.cat))f.push("Unknown VAT category");
  return{p,net,vat,exp,diff,total:net+vat,flags:f};
}
function purCalc(r,ps,c,dup){
  if(!r.date&&!r.no&&!r.net)return null;
  const p=periodOf(ps,r.date), net=num(r.net), vat=num(r.vat), vatable=PUR_CATS.slice(0,3).includes(r.cat), blocked=/blocked/i.test(r.nature||"");
  const exp=vatable?r2(net*c.rate):0, diff=r2(vat-exp), claimed=r.claimed==="Yes"?vat:0;
  const defensible=(!dup&&r.claimed==="Yes"&&r.valid==="Yes"&&!blocked&&vatable&&(r.cat!==PUR_CATS[0]||vatOk(r.svat)))?vat:0;
  const f=[];
  if(!p)f.push("Date outside audit periods");
  if(!r.cat)f.push("No VAT category");
  if(dup)f.push("Duplicate supplier invoice");
  if(Math.abs(diff)>c.tol)f.push("VAT ≠ 15% × net");
  if(r.cat===PUR_CATS[0]&&!vatOk(r.svat))f.push("Invalid or missing supplier VAT no");
  if(r.claimed==="Yes"&&r.valid!=="Yes")f.push("VAT claimed without a valid tax invoice");
  if(r.claimed==="Yes"&&blocked)f.push("Blocked input VAT claimed");
  if(r.cat===PUR_CATS[1]&&!String(r.bayan||"").trim())f.push("Customs declaration no missing");
  if(r.cat===PUR_CATS[2]&&isSaudi(r.country))f.push("Reverse charge used for a local supplier");
  if(r.claimed==="Yes"&&!vatable&&r.cat)f.push("VAT claimed on a non-taxable category");
  if(r.country&&!isSaudi(r.country)&&net>0&&r.cat!==PUR_CATS[1]&&r.cat!==PUR_CATS[2])f.push("Foreign supplier without reverse charge");
  return{p,net,vat,exp,diff,total:net+vat,claimed,defensible,risk:r2(claimed-defensible),flags:f,dup};
}
function retCalc(r,c,p){
  const n=b=>num(r.b[b].a)+num(r.b[b].j), v=b=>num(r.b[b].v);
  const box6=[1,2,3,4,5].reduce((s,b)=>s+n(b),0), out=[1,2,3,4,5,9].reduce((s,b)=>s+v(b),0);
  const box12=[7,8,9,10,11].reduce((s,b)=>s+n(b),0), inp=[7,8,9,10,11].reduce((s,b)=>s+v(b),0);
  const box13=r2(out-inp), b14=num(r.b14), b15=num(r.b15), b16c=r2(box13+b14-b15);
  const entered=!!(r.filed||String(r.b16).trim()||BOX_IDS.some(b=>String(r.b[b].a).trim()||String(r.b[b].v).trim()));
  const arith=!entered?"none":(Math.abs(num(r.b16)-b16c)<=c.tol?"ok":"bad");
  const fd=D(r.filed); const late=!r.filed?"none":(fd<=p.due?"ok":"bad");
  return{n,v,box6,out,box12,inp,box13,b14,b15,b16:num(r.b16),b16c,entered,arith,late,lateDays:fd&&fd>p.due?daysBetween(p.due,fd):0,b14ok:Math.abs(b14)<=5000};
}
function tbSum(pred,months){let s=0;for(const r of S.tb){if(!pred(r))continue;for(const m of months)s+=num(r.m[m])}return s}
const BENFORD=[0,...Array.from({length:9},(_,i)=>Math.log10(1+1/(i+1)))];
function benford(amts){const c=Array(10).fill(0);let n=0;for(const a of amts){const x=Math.abs(a);if(x<10)continue;const d=+String(Math.floor(x))[0];if(d>=1){c[d]++;n++}}
  const obs=c.map(v=>n?v/n:0);const mad=n?obs.slice(1).reduce((s,o,i)=>s+Math.abs(o-BENFORD[i+1]),0)/9:0;
  return{n,obs,counts:c,mad,level:n<50?"na":mad<=0.006?"close":mad<=0.012?"acceptable":mad<=0.015?"marginal":"nonconforming"}}

function compute(){
  const c=cfg(), ps=periods();
  const sales=S.sales.map(r=>salesCalc(r,ps,c));
  const seen=new Map(); const pur=S.purchases.map(r=>{const k=normNo(r.sup)+"|"+normNo(r.no);const dup=!!(r.no&&seen.has(k));if(r.no&&!seen.has(k))seen.set(k,1);return purCalc(r,ps,c,dup)});
  const rets=ps.map(p=>retCalc(S.returns[p.i],c,p));
  const pays=S.payments.map(r=>{const p=num(r.p), date=D(r.date), per=ps[p-1], due=per?per.due:null, ml=monthsLate(due,date), amt=num(r.amt);
    return{p,date,due,days:due&&date&&date>due?daysBetween(due,date):0,ml,amt,pen:amt>0?r2(amt*c.lpp*ml):0,label:per?per.label:(p===0&&r.date?"Prior period":"")}});
  const st=(diffs,zeros)=>zeros.every(z=>Math.abs(z)<0.005)?"none":(diffs.every(d=>Math.abs(d)<=c.tol)?"ok":"bad");
  const sumS=(p,f,pred)=>sales.reduce((s,x,i)=>x&&x.p===p&&(!pred||pred(S.sales[i]))?s+x[f]:s,0);
  const sumP=(p,f,pred)=>pur.reduce((s,x,i)=>x&&x.p===p&&(!pred||pred(S.purchases[i]))?s+x[f]:s,0);
  const salesRec=[1,2,3,4,5].map((b,k)=>{const cat=SALES_CATS[k];const rows=ps.map((p,i)=>{const ret=rets[i].n(b), reg=sumS(p.no,"net",r=>r.cat===cat), tb=-tbSum(r=>r.map===cat,p.months);
    return{p,ret,reg,tb,d1:ret-reg,d2:ret-tb,s:st([ret-reg,ret-tb],[ret,reg,tb])}});return{b,cat,rows}});
  const outRec=ps.map((p,i)=>{const R=rets[i], ret=R.out, rs=sumS(p.no,"vat"), rr=sumP(p.no,"vat",r=>r.cat===PUR_CATS[2]), reg=rs+rr, rc=r2((R.n(1)+R.n(9))*c.rate), gl=-tbSum(r=>r.map==="Output VAT",p.months);
    return{p,ret,rs,rr,reg,rc,gl,d1:ret-reg,d2:ret-rc,d3:ret-gl,s:st([ret-reg,ret-rc,ret-gl],[ret,reg,gl]),under:Math.max(0,reg-ret,gl-ret)}});
  const inRec=ps.map((p,i)=>{const R=rets[i], ret=R.inp, cl=sumP(p.no,"claimed"), df=sumP(p.no,"defensible"), rk=sumP(p.no,"risk"), gl=tbSum(r=>r.map==="Input VAT",p.months);
    const b8=R.v(8), c8=sumP(p.no,"vat",r=>r.cat===PUR_CATS[1]), b9=R.v(9), c9=sumP(p.no,"vat",r=>r.cat===PUR_CATS[2]);
    return{p,ret,cl,df,rk,gl,d1:ret-cl,d2:ret-gl,s:st([ret-cl,ret-gl],[ret,cl,gl]),over:Math.max(0,ret-df),b8,c8,d8:b8-c8,b9,c9,d9:b9-c9}});
  const isV=r=>r.map==="Output VAT"||r.map==="Input VAT"||r.map==="VAT Payable / Settlement";
  const openSum=S.tb.reduce((s,r)=>isV(r)?s+num(r.open):s,0), openLiab=-openSum;
  let cum=0, vatPrev=0;
  const vatRec=ps.map((p,i)=>{const R=rets[i], net=R.box13+R.b14; cum+=net;
    const paid=pays.reduce((s,x)=>x.p===p.no?s+x.amt:s,0), outst=Math.max(R.b16,0)-paid, latePen=pays.reduce((s,x)=>x.p===p.no?s+x.pen:s,0);
    const unpaidPen=outst>c.tol&&c.asof>p.due?r2(outst*c.lpp*monthsLate(p.due,c.asof)):0;
    const upto=[];for(let m=0;m<=p.months[p.months.length-1];m++)upto.push(m);
    const gl=-(openSum+tbSum(isV,upto)), paidToDate=pays.reduce((s,x)=>x.date&&x.date<=p.en?s+x.amt:s,0), exp=openLiab+cum-paidToDate;
    const diff=r2(gl-exp), prev=i?vatPrev:0; vatPrev=diff; const moved=Math.abs(diff-prev)>c.tol;
    return{p,net,b16:R.b16,paid,outst,latePen,unpaidPen,late:R.late,lateDays:R.lateDays,gl,exp,diff,carried:!moved&&Math.abs(diff)>c.tol,s:Math.abs(diff)<=c.tol?(Math.abs(gl)<0.005&&Math.abs(exp)<0.005?"none":"ok"):(moved?"bad":"none")}});
  const tot=r=>r.m.reduce((s,v)=>s+num(v),0);
  const tbRev=-S.tb.reduce((s,r)=>r.fs==="Revenue"?s+tot(r):s,0), oos=-S.tb.reduce((s,r)=>r.map===OOS_MAP?s+tot(r):s,0);
  const subj=tbRev-oos, retSales=rets.reduce((s,R)=>s+R.box6,0), rdiff=subj-retSales, items=S.recItems.reduce((s,x)=>s+num(x.a),0), unexpl=r2(rdiff-items);
  const tbCheck=[S.tb.reduce((s,r)=>s+num(r.open),0),...Array.from({length:12},(_,m)=>S.tb.reduce((s,r)=>s+num(r.m[m]),0))].map(r2);
  const unmapped=S.tb.filter(r=>(r.code||r.name)&&!r.map).length;
  const C={c,ps,sales,pur,rets,pays,salesRec,outRec,inRec,vatRec,openLiab,rev:{tbRev,oos,subj,retSales,rdiff,items,unexpl},tbCheck,unmapped,
    sFlag:sales.filter(x=>x&&x.flags.length).length,pFlag:pur.filter(x=>x&&x.flags.length).length};
  C.tests=runTests(C);
  C.exposure=exposure(C);
  const app=C.tests.filter(t=>t.status!=="na"), w={high:3,medium:2,low:1};
  const wt=app.reduce((s,t)=>s+w[t.sev],0), wp=app.filter(t=>t.status==="pass").reduce((s,t)=>s+w[t.sev],0);
  C.score=wt?Math.round(100*wp/wt):null;
  C.ready=S.checklist.filter(x=>["Ready","Submitted","N/A"].includes(x.status)).length/S.checklist.length;
  return C;
}

// ================================================================ exposure (two scenarios, no double counting)
function exposure(C){
  const c=C.c, rows=C.ps.map((p,i)=>{const o=C.outRec[i], n=C.inRec[i], v=C.vatRec[i];
    return{p,out:o.under,inp:n.over,latePay:v.latePen+v.unpaidPen,lateFile:v.late==="bad"&&C.rets[i].box13>0?r2(C.rets[i].box13*0.05):0,eligible:!!(c.initCut&&p.due<=c.initCut)}});
  // unexplained revenue beyond what period-level under-declaration already explains
  const extraRev=Math.max(0,r2(Math.max(0,C.rev.unexpl)*c.rate-rows.reduce((s,r)=>s+r.out,0)));
  if(extraRev>0){const last=[...rows].reverse().find(r=>C.rets[r.p.i].entered)||rows[rows.length-1];last.out+=extraRev}
  rows.forEach(r=>{r.tax=r2(r.out+r.inp);r.pen=r2(r.tax*c.irp);r.allPen=r2(r.pen+r.latePay+r.lateFile)});
  const sum=f=>r2(rows.reduce((s,r)=>s+r[f],0));
  const tax=sum("tax"), pen=sum("pen"), latePay=sum("latePay"), lateFile=sum("lateFile");
  const today=todayD(), active=c.init&&c.initEnd&&today<=c.initEnd;
  const waived=active?r2(rows.reduce((s,r)=>r.eligible?s+r.allPen:s,0)):0;
  const A=r2(tax+pen+latePay+lateFile), B=r2(A-waived);
  return{rows,tax,out:sum("out"),inp:sum("inp"),pen,latePay,lateFile,A,B,waived,active,daysLeft:c.initEnd?daysBetween(today,c.initEnd):null,extraRev};
}

// ================================================================ test library (100% population)
const L=(en,ar)=>{AR[en]=ar;return en};
const AREAS={sales:L("Sales","المبيعات"),purchases:L("Purchases","المشتريات"),returns:L("Returns & payments","الإقرارات والسداد"),ledger:L("Ledger & reconciliation","الدفاتر والمطابقة"),anomaly:L("Anomaly analytics","تحليلات الأنماط غير الطبيعية")};
const SEV={high:L("High","عالية"),medium:L("Medium","متوسطة"),low:L("Low","منخفضة")};
function T(id,area,sev,en,ar,ref,go,fn){return{id,area,sev,title:L(en,ar),ref,go,fn}}
const hitS=(C,pred,note)=>S.sales.map((r,i)=>({r,x:C.sales[i],i})).filter(o=>o.x&&pred(o.r,o.x)).map(o=>({ref:o.r.no,date:o.r.date,party:o.r.cust,amount:o.x.net,tax:typeof note==="function"?note(o.r,o.x):0}));
const hitP=(C,pred,taxf)=>S.purchases.map((r,i)=>({r,x:C.pur[i],i})).filter(o=>o.x&&pred(o.r,o.x)).map(o=>({ref:o.r.no,date:o.r.date,party:o.r.sup,amount:o.x.net,tax:taxf?taxf(o.r,o.x):0}));
const hitPer=(C,arr,pred,amt,taxf)=>arr.map((x,i)=>({x,i})).filter(o=>pred(o.x,o.i)).map(o=>({ref:C.ps[o.i].label,date:"",party:"",amount:amt(o.x,o.i),tax:taxf?taxf(o.x,o.i):0}));
const TESTS=[
 T("S01","sales","high","Duplicate sales invoice numbers","أرقام فواتير مبيعات مكررة","VAT IR Art. 53","sales",C=>{const m=new Map();S.sales.forEach(r=>{const k=normNo(r.no);if(k)m.set(k,(m.get(k)||0)+1)});return hitS(C,r=>m.get(normNo(r.no))>1,(r,x)=>0)}),
 T("S02","sales","medium","Gaps in invoice number sequence","فجوات في تسلسل أرقام الفواتير","VAT IR Art. 53(5)","sales",C=>{const g={};S.sales.forEach(r=>{const m=/^(.*?)(\d+)$/.exec(String(r.no||"").trim());if(m&&r.type!=="Credit Note"&&r.type!=="Debit Note")(g[m[1]]=g[m[1]]||[]).push(+m[2])});const out=[];
   Object.entries(g).forEach(([pre,arr])=>{arr.sort((a,b)=>a-b);for(let i=1;i<arr.length;i++)for(let k=arr[i-1]+1;k<arr[i]&&out.length<200;k++)out.push({ref:pre+String(k).padStart(String(arr[i]).length,"0"),date:"",party:"",amount:0,tax:0})});return out}),
 T("S03","sales","high","VAT charged differs from 15% of the net amount","الضريبة المحتسبة تختلف عن 15% من الصافي","VAT Law Art. 2 & 9","sales",C=>hitS(C,(r,x)=>r.cat===SALES_CATS[0]&&Math.abs(x.diff)>C.c.tol,(r,x)=>Math.max(0,-x.diff))),
 T("S04","sales","high","B2B invoices with missing or invalid buyer VAT number","فواتير منشآت برقم ضريبي للعميل مفقود أو غير صحيح","VAT IR Art. 53","sales",C=>hitS(C,(r)=>r.ctype===CUST_TYPES[0]&&!vatOk(r.cvat))),
 T("S05","sales","medium","Simplified invoices issued to VAT-registered businesses","فواتير مبسطة صادرة لمنشآت مسجلة","VAT IR Art. 53(7)","sales",C=>hitS(C,(r)=>r.type==="Simplified Tax Invoice"&&r.ctype===CUST_TYPES[0])),
 T("S06","sales","high","Invoices not reported or cleared on FATOORA","فواتير غير مُبلّغ عنها أو غير معتمدة في فاتورة","E-invoicing Regulation","sales",C=>hitS(C,(r)=>r.fat!=="Yes")),
 T("S07","sales","high","Zero-rated or export sales without evidence","مبيعات بنسبة صفر أو صادرات دون إثبات","VAT IR Art. 32–33","sales",C=>hitS(C,(r)=>(r.cat===SALES_CATS[2]||r.cat===SALES_CATS[3])&&!String(r.ev||"").trim(),(r,x)=>r2(x.net*C.c.rate))),
 T("S08","sales","medium","Credit notes with a positive amount","إشعارات دائنة بمبلغ موجب","VAT IR Art. 54","sales",C=>hitS(C,(r,x)=>r.type==="Credit Note"&&x.net>0)),
 T("S09","sales","medium","Standard-rated sales with zero VAT","مبيعات بالنسبة الأساسية دون ضريبة","VAT Law Art. 2","sales",C=>hitS(C,(r,x)=>r.cat===SALES_CATS[0]&&x.net>0&&Math.abs(x.vat)<0.005,(r,x)=>r2(x.net*C.c.rate))),
 T("S10","sales","low","Credit notes above 10% of standard sales in a period","إشعارات دائنة تتجاوز 10% من المبيعات الأساسية في الفترة","ZATCA risk indicator","sales",C=>C.ps.map(p=>{let g=0,cn=0;S.sales.forEach((r,i)=>{const x=C.sales[i];if(x&&x.p===p.no&&r.cat===SALES_CATS[0]){if(x.net<0)cn+=-x.net;else g+=x.net}});return{p,g,cn}}).filter(o=>o.g>0&&o.cn/o.g>0.1).map(o=>({ref:o.p.label,date:"",party:"",amount:o.cn,tax:0}))),
 T("S11","sales","low","Sales dated outside the audit periods","مبيعات بتاريخ خارج فترات الفحص","—","sales",C=>hitS(C,(r,x)=>!x.p)),
 T("P01","purchases","high","Duplicate supplier invoices (double claim)","فواتير موردين مكررة (خصم مزدوج)","VAT IR Art. 49","pur",C=>hitP(C,(r,x)=>x.dup,(r,x)=>x.claimed)),
 T("P02","purchases","high","Domestic purchases with invalid supplier VAT number","مشتريات محلية برقم ضريبي غير صحيح للمورد","VAT IR Art. 49(7)","pur",C=>hitP(C,(r)=>r.cat===PUR_CATS[0]&&!vatOk(r.svat),(r,x)=>x.claimed)),
 T("P03","purchases","high","Input VAT claimed without a valid tax invoice","ضريبة مدخلات مخصومة دون فاتورة ضريبية صحيحة","VAT IR Art. 49","pur",C=>hitP(C,(r)=>r.claimed==="Yes"&&r.valid!=="Yes",(r,x)=>x.claimed)),
 T("P04","purchases","high","Blocked input VAT claimed (entertainment, vehicles, staff benefits)","خصم ضريبة غير قابلة للخصم (ترفيه، سيارات، منافع موظفين)","VAT IR Art. 50","pur",C=>hitP(C,(r)=>r.claimed==="Yes"&&/blocked/i.test(r.nature||""),(r,x)=>x.claimed)),
 T("P05","purchases","medium","Customs VAT claimed without a customs declaration","ضريبة جمارك مخصومة دون بيان جمركي","VAT IR Art. 49(2)","pur",C=>hitP(C,(r)=>r.cat===PUR_CATS[1]&&!String(r.bayan||"").trim(),(r,x)=>x.claimed)),
 T("P06","purchases","medium","Reverse charge applied to a Saudi supplier","تطبيق الاحتساب العكسي على مورد سعودي","VAT Law Art. 47","pur",C=>hitP(C,(r)=>r.cat===PUR_CATS[2]&&isSaudi(r.country))),
 T("P07","purchases","high","Foreign services with no reverse charge declared","خدمات أجنبية دون إقرار بالاحتساب العكسي","VAT Law Art. 47","pur",C=>hitP(C,(r,x)=>r.country&&!isSaudi(r.country)&&x.net>0&&r.cat!==PUR_CATS[1]&&r.cat!==PUR_CATS[2],(r,x)=>r2(x.net*C.c.rate))),
 T("P08","purchases","medium","Input VAT differs from 15% of the net amount","ضريبة المدخلات تختلف عن 15% من الصافي","VAT Law Art. 2","pur",C=>hitP(C,(r,x)=>PUR_CATS.slice(0,3).includes(r.cat)&&Math.abs(x.diff)>C.c.tol,(r,x)=>Math.max(0,x.diff))),
 T("P09","purchases","medium","VAT claimed on zero-rated, exempt or out-of-scope purchases","خصم ضريبة على مشتريات صفرية أو معفاة أو خارج النطاق","VAT IR Art. 49","pur",C=>hitP(C,(r)=>r.claimed==="Yes"&&r.cat&&!PUR_CATS.slice(0,3).includes(r.cat),(r,x)=>x.claimed)),
 T("R01","returns","high","Return arithmetic does not agree (Box 16)","الصحة الحسابية للإقرار غير متطابقة (خانة 16)","VAT IR Art. 59","ret",C=>hitPer(C,C.rets,x=>x.arith==="bad",x=>x.b16-x.b16c)),
 T("R02","returns","high","Returns filed after the due date","إقرارات قُدمت بعد الموعد","VAT Law Art. 43","ret",C=>hitPer(C,C.rets,x=>x.late==="bad",x=>x.lateDays)),
 T("R03","returns","medium","Box 14 corrections above SAR 5,000","تصحيحات خانة 14 تتجاوز 5,000 ريال","VAT IR Art. 63","ret",C=>hitPer(C,C.rets,x=>!x.b14ok,x=>x.b14)),
 T("R04","returns","high","VAT paid late or still unpaid","ضريبة مسددة متأخراً أو غير مسددة","VAT Law Art. 43","rvat",C=>hitPer(C,C.vatRec,x=>x.latePen>0||x.unpaidPen>0,x=>x.outst,x=>x.latePen+x.unpaidPen)),
 T("R05","returns","medium","Effective Box 1 rate is not 15%","النسبة الفعلية لخانة 1 ليست 15%","VAT Law Art. 2","ret",C=>hitPer(C,C.rets,x=>x.n(1)>0&&Math.abs(x.v(1)-x.n(1)*C.c.rate)>C.c.tol,x=>x.v(1)-x.n(1)*C.c.rate,x=>Math.max(0,x.n(1)*C.c.rate-x.v(1)))),
 T("R06","returns","low","Refund or credit position (ZATCA review trigger)","وضع دائن أو مطالبة باسترداد (مؤشر مراجعة لدى الهيئة)","ZATCA risk indicator","ret",C=>hitPer(C,C.rets,x=>x.entered&&x.b16<0,x=>x.b16)),
 T("L01","ledger","high","Trial balance does not balance","ميزان المراجعة غير متوازن","—","tb",C=>C.tbCheck.map((v,i)=>({v,i})).filter(o=>Math.abs(o.v)>0.005).map(o=>({ref:o.i?monthLabels()[o.i-1]:"Opening",date:"",party:"",amount:o.v,tax:0}))),
 T("L02","ledger","medium","Accounts without a VAT mapping","حسابات بدون تصنيف ضريبي","—","tb",C=>S.tb.filter(r=>(r.code||r.name)&&!r.map).map(r=>({ref:r.code,date:"",party:r.name,amount:0,tax:0}))),
 T("L03","ledger","high","Sales by VAT box do not reconcile","المبيعات حسب خانات الإقرار غير مطابقة","VAT IR Art. 66","rsales",C=>C.salesRec.flatMap(x=>x.rows.filter(r=>r.s==="bad").map(r=>({ref:`Box ${x.b} · ${r.p.label}`,date:"",party:"",amount:r.d2,tax:0})))),
 T("L04","ledger","high","Revenue in the ledger above declared sales","إيرادات في الدفاتر تتجاوز المبيعات المُقر بها","VAT IR Art. 66","rrev",C=>Math.abs(C.rev.unexpl)>C.c.tol?[{ref:"Year",date:"",party:"",amount:C.rev.unexpl,tax:r2(Math.max(0,C.rev.unexpl)*C.c.rate)}]:[]),
 T("L05","ledger","high","Output VAT in the ledger differs from returns","ضريبة المخرجات في الدفاتر تختلف عن الإقرارات","VAT IR Art. 66","rout",C=>hitPer(C,C.outRec,x=>x.s==="bad",x=>x.d3,x=>x.under)),
 T("L06","ledger","high","Input VAT in the ledger differs from returns","ضريبة المدخلات في الدفاتر تختلف عن الإقرارات","VAT IR Art. 66","rin",C=>hitPer(C,C.inRec,x=>x.s==="bad",x=>x.d2,x=>x.over)),
 T("L07","ledger","high","VAT control account does not agree with returns and payments","حساب الضريبة لا يطابق الإقرارات والمدفوعات","VAT IR Art. 66","rvat",C=>hitPer(C,C.vatRec,x=>x.s==="bad",x=>x.diff)),
 T("L08","ledger","medium","Box 8 customs VAT differs from customs declarations","ضريبة خانة 8 تختلف عن البيانات الجمركية","VAT IR Art. 49(2)","rin",C=>hitPer(C,C.inRec,x=>Math.abs(x.d8)>C.c.tol,x=>x.d8)),
 T("A01","anomaly","medium","Sales amounts deviate from Benford's law","مبالغ المبيعات تنحرف عن قانون بنفورد","Analytics","tests",C=>{const b=benford(C.sales.filter(Boolean).map(x=>x.net));C.bfS=b;return b.level==="na"?null:(b.level==="nonconforming"?[{ref:`MAD ${b.mad.toFixed(4)}`,date:"",party:"",amount:b.n,tax:0}]:[])}),
 T("A02","anomaly","medium","Purchase amounts deviate from Benford's law","مبالغ المشتريات تنحرف عن قانون بنفورد","Analytics","tests",C=>{const b=benford(C.pur.filter(Boolean).map(x=>x.net));C.bfP=b;return b.level==="na"?null:(b.level==="nonconforming"?[{ref:`MAD ${b.mad.toFixed(4)}`,date:"",party:"",amount:b.n,tax:0}]:[])}),
 T("A03","anomaly","low","Large round-amount invoices","فواتير بمبالغ كبيرة مقربة","Analytics","sales",C=>[...hitS(C,(r,x)=>Math.abs(x.net)>=50000&&x.net%10000===0),...hitP(C,(r,x)=>Math.abs(x.net)>=50000&&x.net%10000===0)]),
 T("A04","anomaly","low","Invoices dated on a Friday or Saturday","فواتير بتاريخ يوم جمعة أو سبت","Analytics","sales",C=>[...hitS(C,(r)=>{const d=D(r.date);return d&&(d.getUTCDay()===5||d.getUTCDay()===6)}),...hitP(C,(r)=>{const d=D(r.date);return d&&(d.getUTCDay()===5||d.getUTCDay()===6)})]),
 T("A05","anomaly","medium","Input VAT spike: a period above twice the median","ارتفاع مفاجئ في ضريبة المدخلات: فترة تتجاوز ضعف الوسيط","ZATCA risk indicator","rin",C=>{const v=C.rets.map(x=>x.inp).filter(x=>x>0).sort((a,b)=>a-b);if(v.length<3)return null;const med=v[Math.floor(v.length/2)];return hitPer(C,C.rets,x=>x.inp>2*med,x=>x.inp)})];
function runTests(C){return TESTS.map(t=>{let hits=t.fn(C);const na=hits===null;hits=hits||[];
  const noData={sales:!S.sales.length,purchases:!S.purchases.length,returns:!C.rets.some(r=>r.entered),ledger:!S.tb.length,anomaly:false}[t.area];
  const status=na||noData?"na":(hits.length?"fail":"pass");
  return{...t,hits,status,count:hits.length,value:r2(hits.reduce((s,h)=>s+Math.abs(h.amount||0),0)),tax:r2(hits.reduce((s,h)=>s+(h.tax||0),0))}})}

// ================================================================ monetary-unit sampling
function sampleItems(C){
  const pop=S.sample.pop==="purchases"?S.purchases.map((r,i)=>({r,x:C.pur[i],i,key:"p|"+i+"|"+r.no})):S.sales.map((r,i)=>({r,x:C.sales[i],i,key:"s|"+i+"|"+r.no}));
  const items=pop.filter(o=>o.x&&Math.abs(o.x.net)>0);const total=items.reduce((s,o)=>s+Math.abs(o.x.net),0);const n=Math.max(1,Math.min(items.length,Math.round(num(S.sample.size))||1));
  if(!items.length)return{items:[],total:0,interval:0,n:0};
  const interval=total/n, rand=rng(S.sample.seed||"1"), start=rand()*interval, picks=[];let cum=0,k=0;
  for(const o of items){const a=Math.abs(o.x.net);while(k<n&&start+k*interval<cum+a){if(picks[picks.length-1]!==o)picks.push(o);k++}cum+=a}
  return{items:picks,total,interval,n};
}
