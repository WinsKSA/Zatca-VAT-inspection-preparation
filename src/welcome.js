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
function welcomePopup(){
  if(document.querySelector(".wp-back"))return;
  const co=(typeof COMPANY!=="undefined"&&COMPANY)?COMPANY.name:(S.setup&&S.setup.company)||"";
  const yrs=(S.years||[]).length||1,rows=(S.sales||[]).length+(S.purchases||[]).length;
  const steps=[["upl",L("Load your data","حمّل بياناتك"),L("Trial balance, sales, purchases and returns. Paste from Excel or import a file.","ميزان المراجعة والمبيعات والمشتريات والإقرارات. الصق من Excel أو استورد ملفاً."),"hub"],
    ["test",L("Run 39 inspection tests","شغّل 39 اختباراً للفحص"),L("Every invoice is checked the way a ZATCA auditor would.","تُفحص كل فاتورة بالطريقة التي يفحص بها مدقق الهيئة."),"tests"],
    ["shield",L("Close the gaps before ZATCA does","عالج الملاحظات قبل الهيئة"),L("Reconcile, explain findings and see exposure with the fines initiative.","طابق، وفسّر الملاحظات، واعرف التعرض مع مبادرة الإعفاء من الغرامات."),"find"]];
  const back=document.createElement("div");back.className="wp-back";back.setAttribute("role","dialog");back.setAttribute("aria-modal","true");back.setAttribute("aria-labelledby","wpTitle");
  back.innerHTML=`<div class="wp">
    <div class="wp-hero"><i class="wp-orb a"></i><i class="wp-orb b"></i><i class="wp-orb c"></i>
      <button type="button" class="wp-x" id="wpClose" aria-label="${esc(L("Close","إغلاق"))}">×</button>
      <div class="wp-badge"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="18" cy="18" r="8" fill="none" stroke="#fff" stroke-width="3"/><path d="M24 24l7 7" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M14.5 18.5l2.5 2.5 4.5-5" fill="none" stroke="#e3b866" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <span class="wp-eyebrow"><span>${esc(greeting())}</span>${welcomeName()?`<span data-notr>${LANG==="ar"?"، ":", "}</span><span data-notr>${esc(welcomeName())}</span>`:""}</span>
      <h2 id="wpTitle">${esc(L("Welcome to Fahs. Your inspection, under control.","أهلاً بك في فحص. فحصك الضريبي تحت السيطرة."))}</h2>
      ${co?`<p class="wp-co">${icon("building")}<span data-notr>${esc(co)}</span></p>`:""}
      <div class="wp-stats"><div><b class="wp-count" data-to="39">0</b><span>${esc(L("automated tests","اختباراً آلياً"))}</span></div><div><b class="wp-count" data-to="${yrs}">0</b><span>${esc(L("years in scope","سنوات الفحص"))}</span></div><div><b class="wp-count" data-to="${rows}">0</b><span>${esc(L("invoices loaded","فاتورة محمّلة"))}</span></div></div>
    </div>
    <div class="wp-body">
      <p class="wp-lead">${esc(L("Three steps to a confident inspection:","ثلاث خطوات لفحص بثقة:"))}</p>
      <ol class="wp-steps">${steps.map((s,i)=>`<li style="--d:${.15+i*.09}s"><button type="button" data-wgo="${s[3]}"><span class="wp-n">${i+1}</span>${icon(s[0])}<span class="wp-t"><b>${esc(s[1])}</b><small>${esc(s[2])}</small></span></button></li>`).join("")}</ol>
      ${installCard()}
      <div class="wp-foot"><label class="chk"><input type="checkbox" id="wpNever"> ${esc(L("Don't show this again","لا تعرض هذه الرسالة مرة أخرى"))}</label><span class="grow"></span><button type="button" class="btn primary" id="wpGo">${esc(rows?L("Open the command center","افتح مركز القيادة"):L("Start now","ابدأ الآن"))}</button></div>
    </div></div>`;
  document.body.appendChild(back);
  const close=()=>{try{if(back.querySelector("#wpNever").checked)localStorage.setItem(KEY+"-nowelcome","1")}catch(e){}back.classList.add("out");setTimeout(()=>back.remove(),220);document.removeEventListener("keydown",esc_)};
  const esc_=e=>{if(e.key==="Escape")close()};document.addEventListener("keydown",esc_);
  back.addEventListener("click",e=>{if(e.target===back)close()});
  back.querySelector("#wpClose").onclick=close;
  back.querySelector("#wpGo").onclick=()=>{close();go(rows?"dash":"hub")};
  back.querySelectorAll("[data-wgo]").forEach(b=>b.onclick=()=>{close();go(b.dataset.wgo)});
  const ib=back.querySelector("#wpInstall");if(ib)ib.onclick=async()=>{if(!installEvt)return;installEvt.prompt();await installEvt.userChoice;installEvt=null;ib.closest(".wp-install").remove()};
  back.querySelectorAll(".wp-count").forEach(el=>{const to=+el.dataset.to,t0=performance.now(),dur=900;const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=fmtInt(Math.round(to*e));if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)});
  setTimeout(()=>back.querySelector("#wpGo")?.focus(),50);
}
// show once per browser session, right after the workspace opens
{const _r=render;render=function(){_r();
  if(!REMOTE||!AUTH.user||!["saved","saving"].includes(sync.state))return;
  let skip=false;try{skip=localStorage.getItem(KEY+"-nowelcome")==="1"||sessionStorage.getItem(KEY+"-welcomed")==="1";if(!skip)sessionStorage.setItem(KEY+"-welcomed","1")}catch(e){}
  if(!skip)setTimeout(welcomePopup,250)}}
