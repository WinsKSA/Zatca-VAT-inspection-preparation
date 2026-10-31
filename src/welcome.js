// ================================================================ welcome popup after sign-in (once per session) + install-as-app hints
const IS_IOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const IS_STANDALONE=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true||document.documentElement.classList.contains("native");
function greeting(){const h=new Date().getHours();return h<12?L("Good morning","صباح الخير"):h<18?L("Good afternoon","مساء الخير"):L("Good evening","مساء الخير")}
function welcomeName(){const u=AUTH.user||{};const n=String(u.name||u.username||"").trim();return n.includes("@")?n.split("@")[0]:n}
function installCard(){
  if(IS_STANDALONE())return "";
  if(IS_IOS)return `<div class="wp-install">${icon("dl")}<div><b>${esc(L("Install Fahs on your iPhone","ثبّت فحص على جهاز iPhone"))}</b><span>${esc(L("In Safari tap Share, then “Add to Home Screen”.","في Safari اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»."))}</span></div></div>`;
  if(installEvt)return `<div class="wp-install">${icon("dl")}<div><b>${esc(L("Install Fahs as an app","ثبّت فحص كتطبيق"))}</b><span>${esc(L("Opens full screen from your home screen or desktop, like any app.","يفتح بملء الشاشة من الشاشة الرئيسية أو سطح المكتب مثل أي تطبيق."))}</span></div><button type="button" class="btn sm primary" id="wpInstall">${esc(L("Install","تثبيت"))}</button></div>`;
  return "";
}
// "at a glance" visuals: readiness gauge, test results bar, monthly sales vs purchases (palette validated on the dark hero)
function welcomeCharts(){
  let C;try{C=compute()}catch(e){return ""}
  const score=C.score,R=34,CIRC=2*Math.PI*R,off=score==null?CIRC:CIRC*(1-score/100);
  const t=C.tests||[],pass=t.filter(x=>x.status==="pass").length,fail=t.filter(x=>x.status==="fail").length,na=t.length-pass-fail;
  const seg=(n,cls,lab)=>n?`<i class="${cls}" style="flex:${n}" title="${esc(lab)}: ${n}"></i>`:"";
  const mon=Array.from({length:12},()=>({s:0,p:0}));
  (S.sales||[]).forEach((r,i)=>{const d=D(r.date),x=C.sales[i];if(d&&x)mon[d.getUTCMonth()].s+=Math.abs(x.net||0)});
  (S.purchases||[]).forEach((r,i)=>{const d=D(r.date),x=C.pur[i];if(d&&x)mon[d.getUTCMonth()].p+=Math.abs(x.net||0)});
  const mx=Math.max(1,...mon.map(m=>Math.max(m.s,m.p))),has=mon.some(m=>m.s||m.p);
  const mname=i=>LANG==="ar"&&typeof MON_AR!=="undefined"?MON_AR[i]:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i];
  const bars=has?mon.map((m,i)=>`<div class="wp-col" title="${esc(mname(i))} · ${esc(L("Sales","المبيعات"))} ${fmt(m.s)} · ${esc(L("Purchases","المشتريات"))} ${fmt(m.p)}"><i class="s" style="--h:${(m.s/mx*100).toFixed(1)}%;--d:${(i*.04).toFixed(2)}s"></i><i class="p" style="--h:${(m.p/mx*100).toFixed(1)}%;--d:${(i*.04+.02).toFixed(2)}s"></i></div>`).join(""):`<p class="wp-empty">${esc(L("No data yet. Your monthly chart appears here.","لا توجد بيانات بعد. سيظهر هنا الرسم الشهري."))}</p>`;
  return `<div class="wp-glance">
    <div class="wp-gauge" role="img" aria-label="${esc(L("Inspection readiness","جاهزية الفحص"))} ${score==null?"—":score+"%"}">
      <svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="${R}" class="tr"/><circle cx="42" cy="42" r="${R}" class="fg${score==null?"":score>=80?" ok":score>=50?" warn":" bad"}" style="--c:${CIRC.toFixed(1)};--o:${off.toFixed(1)}"/></svg>
      <b>${score==null?"—":`<span class="wp-count" data-to="${score}">0</span>%`}</b><span>${esc(L("Readiness","الجاهزية"))}</span></div>
    <div class="wp-chart"><div class="wp-ch-h"><b>${esc(L("Sales vs purchases by month","المبيعات مقابل المشتريات شهرياً"))}</b><span class="wp-leg"><i class="s"></i>${esc(L("Sales","المبيعات"))}<i class="p"></i>${esc(L("Purchases","المشتريات"))}</span></div>
      <div class="wp-bars">${bars}</div></div>
    <div class="wp-tests"><div class="wp-ch-h"><b>${esc(L("Inspection tests","اختبارات الفحص"))}</b><span class="wp-leg"><span><i class="tk ok"></i><b data-notr>${pass}</b> <span>${esc(L("passed","ناجح"))}</span></span><span><i class="tk bad"></i><b data-notr>${fail}</b> <span>${esc(L("with findings","بملاحظات"))}</span></span><span><i class="tk na"></i><b data-notr>${na}</b> <span>${esc(L("need data","تحتاج بيانات"))}</span></span></span></div>
      <div class="wp-stack">${seg(pass,"ok",L("Passed","ناجح"))}${seg(fail,"bad",L("With findings","بملاحظات"))}${seg(na,"na",L("Need data","تحتاج بيانات"))}</div></div>
  </div>`;
}
function welcomePopup(){
  if(document.querySelector(".wp-back"))return;
  const co=(typeof COMPANY!=="undefined"&&COMPANY)?COMPANY.name:(S.setup&&S.setup.company)||"";
  const yrs=(S.years||[]).length||1,rows=(S.sales||[]).length+(S.purchases||[]).length;
  const steps=[["upl",L("Load your data","حمّل بياناتك"),L("Trial balance, sales, purchases and returns. Paste from Excel or import a file.","ميزان المراجعة والمبيعات والمشتريات والإقرارات. الصق من Excel أو استورد ملفاً."),"hub"],
    ["test",L("Run 39 inspection tests","شغّل 39 اختباراً للفحص"),L("Every invoice is checked the way a ZATCA auditor would.","تُفحص كل فاتورة بالطريقة التي يفحص بها مدقق الهيئة."),"tests"],
    ["shield",L("Close the gaps before ZATCA does","عالج الملاحظات قبل الهيئة"),L("Reconcile, explain findings and see exposure with the fines initiative.","طابق، وفسّر الملاحظات، واعرف التعرض مع مبادرة الإعفاء من الغرامات."),"find"]];
  const back=document.createElement("div");back.className="wp-back";back.setAttribute("role","dialog");back.setAttribute("aria-modal","true");back.setAttribute("aria-labelledby","wpTitle");
  back.innerHTML=`<div class="wp">
    <div class="wp-hero"><i class="wp-orb a"></i><i class="wp-orb b"></i><i class="wp-orb c"></i><div class="wp-sparks" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i style="--x:${(i*8.7+3)%100}%;--s:${5+(i*3)%7}s;--d:-${(i*1.3)%6}s"></i>`).join("")}</div>
      <button type="button" class="wp-x" id="wpClose" aria-label="${esc(L("Close","إغلاق"))}">×</button>
      <div class="wp-badge${S.setup.logo?" logo":""}"><i class="wp-glow" aria-hidden="true"></i>${S.setup.logo?`<img src="${esc(S.setup.logo)}" alt="${esc(co)}">`:`<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="18" cy="18" r="8" fill="none" stroke="#fff" stroke-width="3"/><path d="M24 24l7 7" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M14.5 18.5l2.5 2.5 4.5-5" fill="none" stroke="#88d8ad" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`}</div>
      <span class="wp-eyebrow"><span>${esc(greeting())}</span>${welcomeName()?`<span data-notr>${LANG==="ar"?"، ":", "}</span><span data-notr>${esc(welcomeName())}</span>`:""}</span>
      <h2 id="wpTitle">${esc(L("Welcome to Fahs. Your inspection, under control.","أهلاً بك في فحص. فحصك الضريبي تحت السيطرة."))}</h2>
      <p class="wp-slogan" data-notr>${esc(SLOGAN())}</p>
      ${co?`<p class="wp-co">${icon("building")}<span data-notr>${esc(co)}</span></p>`:""}
      <div class="wp-stats"><div><b class="wp-count" data-to="39">0</b><span>${esc(L("automated tests","اختباراً آلياً"))}</span></div><div><b class="wp-count" data-to="${yrs}">0</b><span>${esc(L("years in scope","سنوات الفحص"))}</span></div><div><b class="wp-count" data-to="${rows}">0</b><span>${esc(L("invoices loaded","فاتورة محمّلة"))}</span></div></div>
      ${welcomeCharts()}
    </div>
    <div class="wp-body">
      <p class="wp-lead">${esc(L("Three steps to a confident inspection:","ثلاث خطوات لفحص بثقة:"))}</p>
      <ol class="wp-steps">${steps.map((s,i)=>`<li style="--d:${.15+i*.09}s"><button type="button" data-wgo="${s[3]}"><span class="wp-n">${i+1}</span>${icon(s[0])}<span class="wp-t"><b>${esc(s[1])}</b><small>${esc(s[2])}</small></span></button></li>`).join("")}</ol>
      ${installCard()}
      <div class="wp-foot"><span class="grow"></span><button type="button" class="btn primary" id="wpGo">${esc(rows?L("Open the command center","افتح مركز القيادة"):L("Start now","ابدأ الآن"))}</button></div>
    </div></div>`;
  document.body.appendChild(back);
  // the whole entrance (fade-in, charts, steps, light sweep) plays over 9 seconds; looping effects keep their own pace
  const INTRO_MS=9000;
  if(back.getAnimations)requestAnimationFrame(()=>{const an=back.getAnimations({subtree:true}).filter(a=>a.effect&&a.effect.getTiming().iterations!==Infinity);
    const end=Math.max(1,...an.map(a=>{const t=a.effect.getTiming();return (t.delay||0)+(+t.duration||0)}));an.forEach(a=>{a.playbackRate=end/INTRO_MS})});
  const close=()=>{back.classList.add("out");setTimeout(()=>back.remove(),620);document.removeEventListener("keydown",esc_)};
  const esc_=e=>{if(e.key==="Escape")close()};document.addEventListener("keydown",esc_);
  back.addEventListener("click",e=>{if(e.target===back)close()});
  back.querySelector("#wpClose").onclick=close;
  back.querySelector("#wpGo").onclick=()=>{close();go(rows?"dash":"hub")};
  back.querySelectorAll("[data-wgo]").forEach(b=>b.onclick=()=>{close();go(b.dataset.wgo)});
  const ib=back.querySelector("#wpInstall");if(ib)ib.onclick=async()=>{if(!installEvt)return;installEvt.prompt();await installEvt.userChoice;installEvt=null;ib.closest(".wp-install").remove()};
  back.querySelectorAll(".wp-count").forEach(el=>{const to=+el.dataset.to,t0=performance.now()+1500,dur=5800;const step=t=>{const k=Math.max(0,Math.min(1,(t-t0)/dur)),e=1-Math.pow(1-k,3);el.textContent=fmtInt(Math.round(to*e));if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)});
  setTimeout(()=>back.querySelector("#wpGo")?.focus({preventScroll:true}),50);
}
// ---------------------------------------------------------------- sign out after 5 minutes without activity
// Last activity is shared by every tab; reopening the app after 5 idle minutes starts at the sign-in page.
const IDLE_MS=5*60*1000,IDLE_WARN_MS=30*1000,ACT_KEY=KEY+"-active";
const signedIn=()=>REMOTE&&!!AUTH.user&&!["login","otp","setup","signup","forgot","reset","setpw"].includes(sync.state);
const lastActive=()=>{try{return +localStorage.getItem(ACT_KEY)||0}catch(e){return 0}};
const touchActive=()=>{try{localStorage.setItem(ACT_KEY,String(Date.now()))}catch(e){}};
if(REMOTE){const la=lastActive();if(la&&Date.now()-la>IDLE_MS){
  try{Object.keys(localStorage).filter(k=>/^sb-.*-auth-token$/.test(k)).forEach(k=>localStorage.removeItem(k))}catch(e){}
  if(typeof setToken==="function"&&AUTH.token)setToken(null);sync.msg=L("You were signed out after 5 minutes without activity.","تم تسجيل خروجك بعد 5 دقائق دون نشاط.")}}
let idleWarn=null;
function idleDialog(){if(idleWarn)return;idleWarn=document.createElement("div");idleWarn.className="modal-back idle-back";
  idleWarn.innerHTML=`<div class="modal idle" role="alertdialog" aria-modal="true" aria-labelledby="idleT"><h3 id="idleT">${esc(L("Are you still there?","هل ما زلت هنا؟"))}</h3><p class="note">${esc(L("For your security you'll be signed out in","حفاظاً على أمانك سيتم تسجيل خروجك خلال"))} <b class="idle-n" data-notr>30</b> ${esc(L("seconds.","ثانية."))}</p><div class="row end"><button type="button" class="btn" id="idleOut">${esc(L("Sign out now","تسجيل الخروج الآن"))}</button><button type="button" class="btn primary" id="idleStay">${esc(L("Stay signed in","البقاء متصلاً"))}</button></div></div>`;
  document.body.appendChild(idleWarn);idleWarn.querySelector("#idleStay").onclick=()=>{touchActive();closeIdle()};idleWarn.querySelector("#idleOut").onclick=()=>idleSignOut(L("You have signed out.","تم تسجيل الخروج."));idleWarn.querySelector("#idleStay").focus()}
function closeIdle(){if(idleWarn){idleWarn.remove();idleWarn=null}}
function idleSignOut(msg){closeIdle();document.querySelector(".wp-back")?.remove();WELCOMED=false;try{localStorage.removeItem(ACT_KEY)}catch(e){}
  if(SUPA)signedOut(msg);else{(async()=>{try{await api("logout")}catch(e){}signedOut(msg)})()}}
if(REMOTE){let t=0;const bump=()=>{const n=Date.now();if(n-t>4000){t=n;if(!idleWarn)touchActive()}};
  ["pointerdown","keydown","wheel","touchstart","mousemove","scroll"].forEach(ev=>addEventListener(ev,bump,{passive:true,capture:true}));
  setInterval(()=>{if(!signedIn()){closeIdle();return}const idle=Date.now()-(lastActive()||Date.now());
    if(idle>=IDLE_MS)idleSignOut(L("You were signed out after 5 minutes without activity.","تم تسجيل خروجك بعد 5 دقائق دون نشاط."));
    else if(idle>=IDLE_MS-IDLE_WARN_MS){idleDialog();const n=idleWarn.querySelector(".idle-n");if(n)n.textContent=String(Math.max(0,Math.ceil((IDLE_MS-idle)/1000)))}
    else closeIdle()},1000);
  addEventListener("storage",e=>{if(e.key===ACT_KEY)closeIdle()})}

// the welcome message opens every time the system opens (each page load) and after every sign-in
let WELCOMED=false;
{const _r=render;render=function(){_r();
  // sign-in page: count the readiness number up with the ring
  document.querySelectorAll(".w-num:not(.done)").forEach(el=>{el.classList.add("done");const to=+el.textContent,t0=performance.now()+500,dur=1800;el.textContent="0";
    const step=t=>{const k=Math.max(0,Math.min(1,(t-t0)/dur)),e=1-Math.pow(1-k,3);el.textContent=String(Math.round(to*e));if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)});
  if(!REMOTE)return;
  if(!AUTH.user||["login","otp","setup","signup","forgot","reset","setpw"].includes(sync.state)){WELCOMED=false;return}
  if(!["saved","saving"].includes(sync.state)||WELCOMED)return;
  WELCOMED=true;touchActive();setTimeout(welcomePopup,250)}}
