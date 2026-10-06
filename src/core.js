"use strict";
// ================================================================ constants
const SALES_CATS=["Standard 15% (Box 1)","Citizens - Healthcare/Education (Box 2)","Zero-rated domestic (Box 3)","Export (Box 4)","Exempt (Box 5)","Out of scope"];
const PUR_CATS=["Standard domestic 15% (Box 7)","Import - VAT paid at customs (Box 8)","Import - Reverse charge (Box 9)","Zero-rated purchase (Box 10)","Exempt purchase (Box 11)","Out of scope / Not reported"];
const OOS_MAP="Revenue - Out of scope / Other income";
const TB_MAPS=[...SALES_CATS.slice(0,5),OOS_MAP,"Output VAT","Input VAT","VAT Payable / Settlement","Not VAT relevant"];
const DOC_TYPES=["Tax Invoice","Simplified Tax Invoice","Credit Note","Debit Note"];
const CUST_TYPES=["B2B - VAT registered","B2B - Not registered","B2C - Individual","Government"];
const NATURE=["General business expense","Capital asset","Entertainment / hospitality (blocked)","Motor vehicle - private use (blocked)","Staff personal benefit (blocked)","Other non-business (blocked)"];
const YN=["Yes","No"], FS=["Asset","Liability","Equity","Revenue","Expense"], STATUS=["Not started","In progress","Ready","Submitted","N/A"];
const AUDIT_TYPES=["Desk audit","Field audit","Information request","Refund review"];
const REQ_STATUS=["Open","In preparation","Submitted","Closed"];
const VOUCH=["Not tested","Agreed","Exception"];
const DECISIONS=["","Correct and disclose","Defend with evidence","Accept assessment","Not an issue"];
const BOXES=[
 {b:1,en:"Standard rated sales (15%)",ar:"المبيعات الخاضعة للنسبة الأساسية"},
 {b:2,en:"Sales to citizens (private healthcare / education)",ar:"المبيعات للمواطنين (الخدمات الصحية والتعليم الأهلي)"},
 {b:3,en:"Zero-rated domestic sales",ar:"المبيعات المحلية الخاضعة للنسبة الصفرية"},
 {b:4,en:"Exports",ar:"الصادرات"},
 {b:5,en:"Exempt sales",ar:"المبيعات المعفاة"},
 {b:7,en:"Standard rated domestic purchases (15%)",ar:"المشتريات المحلية الخاضعة للنسبة الأساسية"},
 {b:8,en:"Imports subject to VAT paid at customs",ar:"الاستيرادات الخاضعة للضريبة المدفوعة في الجمارك"},
 {b:9,en:"Imports subject to VAT – reverse charge",ar:"الاستيرادات الخاضعة لآلية الاحتساب العكسي"},
 {b:10,en:"Zero-rated purchases",ar:"المشتريات الخاضعة للنسبة الصفرية"},
 {b:11,en:"Exempt purchases",ar:"المشتريات المعفاة"}];
const BOX_IDS=BOXES.map(x=>x.b);
const CHECKLIST=[
["General","VAT registration certificate, Commercial Registration, Articles of Association"],
["General","Description of business activities and revenue streams, with the VAT treatment of each"],
["General","List of branches, related parties and VAT group members"],
["General","Chart of accounts with VAT mapping","Trial balance"],
["General","ERP and e-invoicing (FATOORA) solution details, onboarding and CSID"],
["General","Authorisation letter for the representative dealing with ZATCA"],
["Financial","Audited financial statements for each year under review"],
["Financial","Monthly trial balances (opening, movements, closing)","Trial balance"],
["Financial","General ledger detail for revenue, VAT and major expense accounts"],
["Financial","Bank statements (ZATCA compares receipts with declared sales)"],
["VAT returns","Copies of all filed VAT returns and SADAD payment receipts","VAT returns, Payments"],
["VAT returns","Voluntary disclosures and corrections filed (Box 14 usage)","VAT returns"],
["Reconciliation","Revenue per financial statements vs total sales per VAT returns","Revenue reconciliation"],
["Reconciliation","Sales per VAT box vs sales listing vs GL, by period","Sales reconciliation"],
["Reconciliation","Output VAT per GL vs returns","Output VAT reconciliation"],
["Reconciliation","Input VAT per GL vs returns","Input VAT reconciliation"],
["Reconciliation","VAT payable account roll-forward","VAT account reconciliation"],
["Reconciliation","Customs import data (Bayan) vs Box 8","Input VAT reconciliation"],
["Sales","Sales listing at invoice level with customer VAT numbers","Sales register"],
["Sales","Sample tax invoices, simplified invoices, credit and debit notes (XML / QR)"],
["Sales","Export evidence: customs exit declarations, bills of lading, contracts, payment proof","Sales register"],
["Sales","Zero-rated domestic supply evidence (qualifying medicines, international transport, etc.)","Sales register"],
["Sales","Exempt supplies support (financial services margin, residential leases)"],
["Sales","Major customer contracts, including government contracts and VAT clauses"],
["Sales","Deemed supplies: free samples, gifts, own use, staff benefits, write-offs"],
["Sales","Related-party and intercompany charges and their VAT treatment"],
["Sales","Fixed asset and real estate disposals (VAT / RETT treatment)"],
["Purchases","Purchase listing at invoice level with supplier VAT numbers","Purchase register"],
["Purchases","Sample supplier tax invoices supporting input VAT claimed","Purchase register"],
["Purchases","Import customs declarations (Bayan) and proof of customs VAT paid","Purchase register"],
["Purchases","Reverse charge: foreign supplier invoices, contracts, RCM calculation","Purchase register"],
["Purchases","Blocked input VAT analysis (entertainment, vehicles, staff benefits)","Purchase register"],
["Purchases","Fixed asset register and capital asset adjustments"],
["Purchases","Input VAT apportionment calculation (if any exempt supplies)"],
["Cross-tax","Withholding tax returns (foreign payments should match Box 9)"],
["Cross-tax","Zakat / income tax return revenue vs VAT revenue"],
["E-invoicing","Phase 2 integration wave and cleared / reported invoices report","Sales register"],
["Response","Written explanation for every difference found","Reconciliations"]];

// ================================================================ state
const KEY="fahs-vat-v2";
function blankReturn(){const b={};BOX_IDS.forEach(x=>b[x]={a:"",j:"",v:""});return{filed:"",ref:"",b,b14:"",b15:"",b16:""}}
function exampleState(){
  const s={example:true,
   setup:{company:"Example Trading Company",vat:"300000000000003",cr:"1010000000",fy:"2025-01-01",freq:"Monthly",rate:"15",tol:"10",asof:"2026-10-04",lpp:"5",irp:"50",init:"Yes",initEnd:"2026-12-31",initCut:"2026-06-30"},
   tb:[],returns:Array.from({length:12},blankReturn),sales:[],purchases:[],payments:[],
   checklist:CHECKLIST.map((c,i)=>({status:i<8?"Ready":(i<14?"In progress":"Not started"),owner:i<8?"Finance":"",ref:"",notes:""})),
   recItems:[{d:"Timing – invoices booked in a different period",a:""},{d:"Revenue accruals not yet invoiced",a:""},{d:"Other",a:""}],
   case:{notice:"ZATCA-AUD-2026-118734",type:"Field audit",received:"2026-09-21",due:"2026-10-11",auditor:"",scope:"VAT returns January – December 2025",notes:""},
   requests:[{item:"Monthly trial balances and general ledger for 2025",req:"2026-09-21",due:"2026-10-05",status:"Submitted",sent:"2026-10-02",ref:"Pack-01"},
     {item:"Revenue reconciliation: financial statements vs VAT returns",req:"2026-09-21",due:"2026-10-05",status:"In preparation",sent:"",ref:""},
     {item:"Export evidence for all zero-rated sales",req:"2026-09-21",due:"2026-10-11",status:"Open",sent:"",ref:""},
     {item:"Supplier invoices supporting input VAT above SAR 5,000",req:"2026-09-28",due:"2026-10-11",status:"Open",sent:"",ref:""}],
   sample:{pop:"sales",size:"10",seed:"2026"},vouch:{},decisions:{}};
  const tb=(code,name,fs,map,open,mv)=>{const m=Array(12).fill("");Object.entries(mv).forEach(([k,v])=>m[k-1]=String(v));return{code,name,fs,map,open:String(open),m}};
  s.tb=[tb("1100","Cash at Bank","Asset","Not VAT relevant",500000,{1:81000,2:71150}),
    tb("2210","Output VAT","Liability","Output VAT",0,{1:-16500,2:-18750}),
    tb("2220","Input VAT","Asset","Input VAT",0,{1:7500,2:9600}),
    tb("2230","VAT Payable – Settlement with ZATCA","Liability","VAT Payable / Settlement",0,{2:9000}),
    tb("3100","Share Capital / Retained Earnings","Equity","Not VAT relevant",-500000,{}),
    tb("4100","Sales – Local","Revenue",SALES_CATS[0],0,{1:-100000,2:-125000}),
    tb("4200","Sales – Export","Revenue",SALES_CATS[3],0,{1:-20000,2:-30000}),
    tb("4900","Other Income – Dividends","Revenue",OOS_MAP,0,{1:-2000}),
    tb("5100","Cost of Goods Purchased","Expense","Not VAT relevant",0,{1:40000,2:60000}),
    tb("6100","Consulting Fees – Foreign","Expense","Not VAT relevant",0,{1:10000}),
    tb("6200","Hospitality & Entertainment","Expense","Not VAT relevant",0,{2:4000}),
    tb("6300","Software Subscriptions – Foreign","Expense","Not VAT relevant",0,{2:20000})];
  const r=s.returns[0]; r.filed="2025-02-25"; r.ref="VAT-2025-01";
  r.b[1]={a:"100000",j:"",v:"15000"}; r.b[4]={a:"20000",j:"",v:"0"}; r.b[7]={a:"40000",j:"",v:"6000"}; r.b[9]={a:"10000",j:"",v:"1500"}; r.b16="9000";
  const f=s.returns[1]; f.filed="2025-04-03"; f.ref="VAT-2025-02";
  f.b[1]={a:"120000",j:"",v:"18000"}; f.b[4]={a:"30000",j:"",v:"0"}; f.b[7]={a:"124000",j:"",v:"18600"}; f.b16="-600";
  const sl=(date,no,type,cust,cvat,ctype,cat,net,vat,uuid,fat,gl,ev)=>({date,no,type,cust,cvat,ctype,cat,net:String(net),vat:String(vat),uuid,fat,gl,ev});
  s.sales=[sl("2025-01-15","INV-0001","Tax Invoice","ABC Trading Co","310123456700003",CUST_TYPES[0],SALES_CATS[0],100000,15000,"e3b0c442-98fc","Yes","4100",""),
    sl("2025-01-20","INV-0002","Tax Invoice","Gulf Imports LLC (UAE)","",CUST_TYPES[1],SALES_CATS[3],20000,0,"a1f2c3d4-55aa","Yes","4200","Customs exit 123456 + B/L GLF-889"),
    sl("2025-02-05","INV-0003","Tax Invoice","Riyadh Retail Est.","310987654300003",CUST_TYPES[0],SALES_CATS[0],80000,12000,"77c1d2e3-01ab","Yes","4100",""),
    sl("2025-02-12","INV-0004","Tax Invoice","Najd Contracting","31012345",CUST_TYPES[0],SALES_CATS[0],50000,7500,"88d2e3f4-02bc","Yes","4100",""),
    sl("2025-02-18","INV-0006","Tax Invoice","Oman Foods LLC","",CUST_TYPES[1],SALES_CATS[3],30000,0,"99e3f4a5-03cd","Yes","4200",""),
    sl("2025-02-21","CN-0007","Credit Note","Walk-in customer","",CUST_TYPES[2],SALES_CATS[0],-5000,-750,"aaf4a5b6-04de","Yes","4100","")];
  const pu=(date,no,sup,svat,country,cat,nature,net,vat,valid,claimed,bayan,gl)=>({date,no,sup,svat,country,cat,nature,net:String(net),vat:String(vat),valid,claimed,bayan,gl});
  s.purchases=[pu("2025-01-10","SUP-778","Al Noor Supplies","310123456700003","Saudi Arabia",PUR_CATS[0],NATURE[0],40000,6000,"Yes","Yes","","5100"),
    pu("2025-01-25","FX-2025-01","Global Consulting Ltd","","United Kingdom",PUR_CATS[2],NATURE[0],10000,1500,"Yes","Yes","","6100"),
    pu("2025-02-08","SUP-801","Al Noor Supplies","310123456700003","Saudi Arabia",PUR_CATS[0],NATURE[0],60000,9000,"Yes","Yes","","5100"),
    pu("2025-02-08","SUP-801","Al Noor Supplies","310123456700003","Saudi Arabia",PUR_CATS[0],NATURE[0],60000,9000,"Yes","Yes","","5100"),
    pu("2025-02-14","H-5521","Al Faisaliah Hotel","300555666700003","Saudi Arabia",PUR_CATS[0],NATURE[2],4000,600,"Yes","Yes","","6200"),
    pu("2025-02-28","CS-99812","Cloud Software Inc","","United States",PUR_CATS[5],NATURE[0],20000,0,"No","No","","6300")];
  s.payments=[{p:"1",date:"2025-02-27",ref:"SADAD-90012345",amt:"9000",notes:"Jan 2025 VAT"}];
  return s;
}
let S;
function migrate(x){const e=exampleState();for(const k of Object.keys(e))if(x[k]==null)x[k]=e[k];for(const k of Object.keys(e.setup))if(x.setup[k]==null)x.setup[k]=e.setup[k];if(!x.returns||x.returns.length!==12)x.returns=e.returns;return x}
let HAD_CACHE=false;
try{const raw=localStorage.getItem(KEY);if(raw){S=migrate(JSON.parse(raw));HAD_CACHE=true}else S=exampleState()}catch(e){S=exampleState()}
// The Excel reader (~900 KB) is only needed for imports, so it loads on first use.
let xlsxPromise=null;
function ensureXLSX(){if(typeof XLSX!=="undefined")return Promise.resolve();if(!xlsxPromise)xlsxPromise=new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onload=()=>res();s.onerror=()=>{xlsxPromise=null;rej(new Error("lib"))};document.head.appendChild(s)});return xlsxPromise}
let saveTimer=null,saveWarned=false;

// ================================================================ helpers
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function num(v){if(typeof v==="number")return isFinite(v)?v:0;if(v==null)return 0;let s=String(v).trim().replace(/[,\s]|SAR|ر\.س/gi,"");if(!s)return 0;let neg=false;if(/^\(.*\)$/.test(s)){neg=true;s=s.slice(1,-1)}const n=parseFloat(s);return isFinite(n)?(neg?-n:n):0}
const r2=n=>Math.round((n+Number.EPSILON)*100)/100;
function fmt(n){n=r2(n||0);if(Math.abs(n)<0.005)return "–";const s=Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});return n<0?`(${s})`:s}
function fmt0(n){n=Math.round(n||0);if(!n)return "0";const s=Math.abs(n).toLocaleString("en-US");return n<0?`(${s})`:s}
function fmtK(n){const a=Math.abs(n);if(a>=1e6)return (n/1e6).toFixed(a>=1e7?0:1)+"M";if(a>=1e3)return (n/1e3).toFixed(a>=1e4?0:1)+"K";return String(Math.round(n))}
const fmtInt=n=>(n||0).toLocaleString("en-US");
const pad=n=>String(n).padStart(2,"0");
function iso(d){return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`}
function D(s){if(!s)return null;const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);return m?new Date(Date.UTC(+m[1],+m[2]-1,+m[3])):null}
function addM(d,n){return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+n,1))}
function eom(d){return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0))}
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const showDate=s=>{const d=typeof s==="string"?D(s):s;return d?`${pad(d.getUTCDate())} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`:""};
function normDate(v){
  if(v==null||v==="")return "";
  if(v instanceof Date&&!isNaN(v))return `${v.getFullYear()}-${pad(v.getMonth()+1)}-${pad(v.getDate())}`;
  if(typeof v==="number"&&v>20000&&v<80000)return iso(new Date(Date.UTC(1899,11,30)+Math.round(v)*864e5));
  const s=String(v).trim();let m;
  if((m=/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(s)))return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  if((m=/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(s)))return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  if((m=/^(\d{1,2})[-\s]([A-Za-z]{3})[A-Za-z]*[-\s](\d{4})/.exec(s))){const i=MON.findIndex(x=>x.toLowerCase()===m[2].toLowerCase());if(i>=0)return `${m[3]}-${pad(i+1)}-${pad(m[1])}`}
  if(/^\d{5}$/.test(s))return normDate(+s);
  return s;
}
function normSel(v,opts){if(v==null)return "";const s=String(v).trim();if(!s)return "";const hit=opts.find(o=>o.toLowerCase()===s.toLowerCase());if(hit)return hit;const rev=opts.find(o=>AR[o]===s);if(rev)return rev;const part=opts.find(o=>o.toLowerCase().startsWith(s.toLowerCase()));return part||s}
const vatOk=v=>/^3\d{13}3$/.test(String(v||"").trim());
const isSaudi=c=>/saudi|\bksa\b|السعودية/i.test(c||"");
const todayD=()=>{const t=new Date();return new Date(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate()))};
const daysBetween=(a,b)=>Math.round((b-a)/864e5);
function toast(t){const el=document.createElement("div");el.className="toast";el.setAttribute("role","status");el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),3400)}
function confirmBox(msg,okLabel,onOk){const back=document.createElement("div");back.className="modal-back";back.innerHTML=`<div class="modal" role="dialog" aria-modal="true"><p>${esc(msg)}</p><div class="row end"><button class="btn" id="mCancel">Cancel</button><button class="btn primary" id="mOk">${esc(okLabel)}</button></div></div>`;document.body.appendChild(back);back.querySelector("#mCancel").onclick=()=>back.remove();back.querySelector("#mOk").onclick=()=>{back.remove();onOk()};back.querySelector("#mOk").focus()}
function copyText(txt){const fallback=()=>{const back=document.createElement("div");back.className="modal-back";back.innerHTML=`<div class="modal"><p>Select all and copy (Ctrl+C), then paste into Excel.</p><textarea readonly></textarea><div class="row end"><button class="btn">Close</button></div></div>`;document.body.appendChild(back);const ta=back.querySelector("textarea");ta.value=txt;ta.select();back.querySelector("button").onclick=()=>back.remove()};
  try{navigator.clipboard.writeText(txt).then(()=>toast("Copied. Paste it into Excel."),fallback)}catch(e){fallback()}}
// seeded random for reproducible samples
function rng(seed){let a=0;for(const ch of String(seed))a=(a*31+ch.charCodeAt(0))>>>0;a=a||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
