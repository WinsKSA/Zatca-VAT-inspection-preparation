// ================================================================ sign-in, first-run setup, users & access, years, install
IC.users='<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 6 4.8"/>';
IC.lock='<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>';
IC.out='<path d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5M10 16l-4-4 4-4M6 12h10"/>';
IC.cal='<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>';
IC.dl='<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>';
const ROLE_AR={Admin:"مدير",Editor:"محرر",Viewer:"مشاهد"};
const roleName=r=>LANG==="ar"?(ROLE_AR[r]||r):r;
const ERR={invalid:L("Wrong username or password.","اسم المستخدم أو كلمة المرور غير صحيحة."),locked:L("Too many wrong attempts. The account is locked for 15 minutes.","محاولات خاطئة كثيرة. تم قفل الحساب لمدة 15 دقيقة."),
  code:L("The setup code is not correct. Copy it from the Users tab of the Google Sheet.","رمز الإعداد غير صحيح. انسخه من ورقة Users في جدول Google."),username:L("Username: 3–32 characters, lowercase letters, numbers, dot, dash or underscore.","اسم المستخدم: من 3 إلى 32 حرفاً إنجليزياً صغيراً أو أرقاماً أو نقطة أو شرطة."),
  weak:L("Password: at least 8 characters with letters and numbers.","كلمة المرور: 8 أحرف على الأقل تتضمن حروفاً وأرقاماً."),exists:L("An administrator already exists. Sign in instead.","يوجد مدير بالفعل. سجّل الدخول بدلاً من ذلك."),
  self:L("You can't remove or demote your own account.","لا يمكنك حذف حسابك أو تخفيض صلاحيتك."),lastAdmin:L("At least one active administrator is required.","يلزم وجود مدير نشط واحد على الأقل."),forbidden:L("You don't have permission for this.","ليست لديك صلاحية لهذا الإجراء."),
  mismatch:L("The two passwords don't match.","كلمتا المرور غير متطابقتين."),pending:L("Your account is waiting for an administrator to approve it.","حسابك بانتظار موافقة المدير."),taken:L("That username is already taken.","اسم المستخدم مستخدم بالفعل."),nosetup:L("The administrator account has not been created yet.","لم يتم إنشاء حساب المدير بعد."),noemail:L("This account has no email address for sign-in codes. Ask an administrator to add one.","لا يوجد بريد إلكتروني لهذا الحساب لإرسال رموز الدخول. اطلب من المدير إضافته."),mail:L("The sign-in code could not be sent. Try again in a minute.","تعذر إرسال رمز الدخول. حاول مرة أخرى بعد دقيقة."),expired:L("The code expired or was used too many times. Sign in again to get a new one.","انتهت صلاحية الرمز أو تجاوز عدد المحاولات. سجّل الدخول مرة أخرى للحصول على رمز جديد."),email:L("Enter a valid email address. Sign-in codes are sent to it.","أدخل بريداً إلكترونياً صحيحاً، فإليه تُرسل رموز الدخول."),net:L("Cannot reach the server. Check your internet connection.","تعذر الوصول إلى الخادم. تحقق من اتصالك بالإنترنت.")};
const errText=e=>ERR[e]||String(e||"");

// ---------------------------------------------------------------- auth screens
// ---------------------------------------------------------------- sign up and forgotten password screens
function authTabs(){const a=sync.state;return `<div class="auth-tabs" role="tablist"><button type="button" role="tab" data-as="login" aria-selected="${a==="login"}">${esc(L("Sign in","تسجيل الدخول"))}</button><button type="button" role="tab" data-as="signup" aria-selected="${a==="signup"}">${esc(L("Sign up","إنشاء حساب"))}</button></div>`}
function authExtraScreen(brand,foot){
  const st=sync.state;
  if(st==="signup")return `<div class="auth">${welcomePanel()}<form class="auth-card" id="authForm" autocomplete="on">${brand}${authTabs()}
   <p class="note">${esc(L("Request access. An administrator approves new accounts before they can sign in.","اطلب الوصول. يوافق المدير على الحسابات الجديدة قبل أن تتمكن من تسجيل الدخول."))}</p>
   <label class="fld"><span>${esc(L("Full name","الاسم الكامل"))}</span><input id="sName" required autocomplete="name"></label>
   <label class="fld"><span>${esc(L("Email (sign-in codes are sent here)","البريد الإلكتروني (تُرسل إليه رموز الدخول)"))}</span><input id="sMail" type="email" required autocomplete="email" dir="ltr"></label>
   <label class="fld"><span>${esc(L("Username","اسم المستخدم"))}</span><input id="sUser" required autocomplete="username" autocapitalize="none" spellcheck="false" dir="ltr"></label>
   <label class="fld"><span>${esc(L("Password","كلمة المرور"))}</span><input id="sPass" type="password" required autocomplete="new-password" dir="ltr"></label>
   <label class="fld"><span>${esc(L("Confirm password","تأكيد كلمة المرور"))}</span><input id="sPass2" type="password" required autocomplete="new-password" dir="ltr"></label>
   <p class="note">${esc(ERR.weak)}</p><p class="auth-err" id="aErr" role="alert">${esc(sync.msg||"")}</p>
   <button class="btn primary" type="submit" id="aGo">${icon("users")}${esc(L("Request access","طلب الوصول"))}</button>${foot}</form></div>`;
  if(st==="forgot"||st==="reset")return `<div class="auth">${welcomePanel()}<form class="auth-card" id="authForm" autocomplete="off">${brand}
   <h1>${esc(L("Reset your password","إعادة تعيين كلمة المرور"))}</h1>
   ${st==="forgot"?`<p class="note">${esc(L("Enter your username. We'll email a 6-digit code to the address on your account.","أدخل اسم المستخدم، وسنرسل رمزاً من 6 أرقام إلى بريدك المسجل."))}</p>
    <label class="fld"><span>${esc(L("Username","اسم المستخدم"))}</span><input id="fUser" required autocomplete="username" autocapitalize="none" spellcheck="false" dir="ltr"></label>`
   :`<p class="note"><span>${esc(L("If the username exists, we sent a code to","إذا كان اسم المستخدم موجوداً فقد أرسلنا رمزاً إلى"))}</span> <b dir="ltr" data-notr>${esc(AUTH.otpTo||"***")}</b>.</p>
    <label class="fld"><span>${esc(L("Code from the email","الرمز من البريد الإلكتروني"))}</span><input id="fCode" class="num otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required dir="ltr"></label>
    <label class="fld"><span>${esc(L("New password","كلمة المرور الجديدة"))}</span><input id="fPass" type="password" required autocomplete="new-password" dir="ltr"></label>
    <label class="fld"><span>${esc(L("Confirm new password","تأكيد كلمة المرور الجديدة"))}</span><input id="fPass2" type="password" required autocomplete="new-password" dir="ltr"></label><p class="note">${esc(ERR.weak)}</p>`}
   <p class="auth-err" id="aErr" role="alert">${esc(sync.msg||"")}</p>
   <button class="btn primary" type="submit" id="aGo">${icon(st==="forgot"?"dl":"lock")}${esc(st==="forgot"?L("Email me a code","أرسل لي رمزاً"):L("Set new password","تعيين كلمة المرور الجديدة"))}</button>
   <button type="button" class="btn ghost sm switch" data-as="login">${esc(L("Back to sign in","العودة لتسجيل الدخول"))}</button>${foot}</form></div>`;
  return null;
}
function bindAuthExtra(){
  document.querySelectorAll("[data-as]").forEach(b=>b.onclick=()=>{sync.msg="";sync.state=b.dataset.as;render()});
  const st=sync.state,f=$("#authForm"),err=$("#aErr"),go=$("#aGo");if(!["signup","forgot","reset"].includes(st))return false;
  const busy=on=>{go.disabled=on;go.classList.toggle("busy",on)};
  ($("#sName")||$("#fUser")||$("#fCode"))?.focus();
  f.onsubmit=async e=>{e.preventDefault();err.textContent="";busy(true);
    try{
      if(st==="signup"){if($("#sPass").value!==$("#sPass2").value){err.textContent=ERR.mismatch;return}
        const r=await api("signup",{name:$("#sName").value,email:$("#sMail").value.trim(),username:$("#sUser").value.trim().toLowerCase(),password:$("#sPass").value});
        if(!r.ok){err.textContent=errText(r.error);return}
        sync.state="login";sync.msg=L("Request sent. You can sign in once an administrator approves your account.","تم إرسال الطلب. يمكنك تسجيل الدخول بعد موافقة المدير على حسابك.");render();return}
      if(st==="forgot"){const r=await api("forgot",{username:$("#fUser").value.trim().toLowerCase()});if(!r.ok){err.textContent=errText(r.error);return}AUTH.challenge=r.challenge;AUTH.otpTo=r.to;sync.msg="";sync.state="reset";render();return}
      if(st==="reset"){if($("#fPass").value!==$("#fPass2").value){err.textContent=ERR.mismatch;return}
        const r=await api("resetPassword",{challenge:AUTH.challenge,code:$("#fCode").value.trim(),password:$("#fPass").value});
        if(!r.ok){err.textContent=r.error==="badcode"?L(`Wrong code. ${r.left} attempt(s) left.`,`رمز غير صحيح. متبقٍ ${r.left} محاولة.`):errText(r.error);if(r.error==="expired"){sync.state="forgot";sync.msg=ERR.expired;render()}return}
        sync.state="login";sync.msg=L("Password changed. Sign in with your new password.","تم تغيير كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.");render();return}
    }catch(x){err.textContent=ERR.net}finally{busy(false)}};
  $("#authLang").onclick=()=>{LANG=LANG==="ar"?"en":"ar";try{localStorage.setItem(KEY+"-lang",LANG)}catch(e){}applyLang();render()};
  return true;
}

// brand line, shown big on the sign-in page and under the logo
const SLOGAN=()=>(LANG==="ar"?"نتعلم من الماضي لنصنع الحاضر ونبني المستقبل":"We learn from the past to shape the present and build the future.");
function sloganHTML(){return `<h2 class="w-slogan" aria-label="${esc(SLOGAN())}">${SLOGAN().split(" ").map((w,i)=>`<span style="--i:${i}" aria-hidden="true" data-notr>${esc(w)}</span>`).join(" ")}</h2>`}
// past -> present -> future, drawn as a line that fills while a light travels along it
function timeHTML(){const st=[["clock",L("The past","الماضي"),L("5 years of returns and ledgers","5 سنوات من الإقرارات والدفاتر")],["check",L("The present","الحاضر"),L("Reconciled and tested today","مطابقة وفحص اليوم")],["flag",L("The future","المستقبل"),L("Ready for every inspection","جاهزية تامة لكل فحص")]];
  return `<div class="w-time" aria-hidden="true"><div class="w-line"><i></i><b></b></div>${st.map(([ic,t,s],i)=>`<div class="w-node" style="--n:${i}"><span class="w-pin">${icon(ic)}</span><b>${esc(t)}</b><small>${esc(s)}</small></div>`).join("")}</div>`}
// animated product preview on the sign-in page: readiness ring, monthly bars, tests ticking, floating result chips
function authShowcase(){
  const bars=[38,52,45,61,57,70,66,78,72,84,80,92];
  const tests=[L("Sales VAT = 15% of net","ضريبة المبيعات = 15% من الصافي"),L("Supplier VAT numbers valid","أرقام الموردين الضريبية صحيحة"),L("Returns agree with the ledger","الإقرارات تطابق الدفاتر"),L("Input VAT is defensible","ضريبة المدخلات قابلة للدفاع")];
  return `<div class="w-show" aria-hidden="true">
   <div class="w-dash">
    <div class="w-dash-h"><span class="w-dot"></span><span class="w-dot"></span><span class="w-dot"></span><b>${esc(L("Inspection command center","مركز قيادة الفحص"))}</b></div>
    <div class="w-dash-b">
     <div class="w-ring"><svg viewBox="0 0 120 120"><defs><linearGradient id="wrg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4cc9b1"/><stop offset="1" stop-color="#e3b866"/></linearGradient></defs><circle cx="60" cy="60" r="50" class="t"/><circle cx="60" cy="60" r="50" class="f"/></svg><div><b class="w-num">92</b><small>%</small></div><span>${esc(L("Readiness","الجاهزية"))}</span></div>
     <div class="w-bars">${bars.map((h,i)=>`<i style="--h:${h}%;--d:${(0.6+i*0.07).toFixed(2)}s"></i>`).join("")}</div>
    </div>
    <ul class="w-ticks">${tests.map((t,i)=>`<li style="--d:${(1.4+i*0.45).toFixed(2)}s"><span class="w-ck">✓</span>${esc(t)}</li>`).join("")}</ul>
   </div>
   <div class="w-chip a"><span class="w-ck">✓</span><span><b>${esc(L("Output VAT reconciled","تمت مطابقة ضريبة المخرجات"))}</b><small>${esc(L("12 of 12 periods","12 من 12 فترة"))}</small></span></div>
   <div class="w-chip b"><span class="w-ck g">٪</span><span><b>${esc(L("Fines initiative applied","تطبيق مبادرة الإعفاء"))}</b><small>${esc(L("Penalties waived to 31 Dec 2026","إعفاء الغرامات حتى 31 ديسمبر 2026"))}</small></span></div>
   <div class="w-chip c"><span class="w-ck">39</span><span><b>${esc(L("Tests on every invoice","اختباراً على كل فاتورة"))}</b><small>${esc(L("Like a ZATCA auditor","كما يفحص مدقق الهيئة"))}</small></span></div>
  </div>`}
function welcomePanel(){const f=[["test",L("39 automated tests on 100% of your data","39 اختباراً آلياً على 100% من بياناتك")],["cal",L("Up to 5 years, monthly or quarterly","حتى 5 سنوات، شهرياً أو ربع سنوي")],["scale",L("Reconciliations, exposure and the fines initiative","المطابقات والتعرض ومبادرة الإعفاء من الغرامات")],["lock",typeof SUPA!=="undefined"&&SUPA?L("Secure sign-in: password or email link","دخول آمن بكلمة المرور أو برابط البريد"):L("Secure sign-in with an email code","دخول آمن برمز عبر البريد الإلكتروني")]];
  return `<aside class="welcome"><div class="w-aurora" aria-hidden="true"><i></i><i></i><i></i></div><div class="w-sparks" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--x:${(i*7.3)%100}%;--s:${6+(i*3)%9}s;--d:-${(i*1.7)%9}s"></i>`).join("")}</div>
   <span class="w-eyebrow">${esc(L("Welcome to Fahs","مرحباً بك في فحص"))}</span>${sloganHTML()}
   <p class="w-sub">${esc(L("Your ZATCA VAT inspection, under control. Prepare every reconciliation, find issues before ZATCA does, and answer every request on time.","فحص هيئة الزكاة والضريبة والجمارك تحت السيطرة. جهّز كل المطابقات، واكتشف الملاحظات قبل الهيئة، وأجب على كل طلب في موعده."))}</p>
   ${timeHTML()}
   ${authShowcase()}
   <ul>${f.map(([i,t],k)=>`<li style="--d:${k*90}ms">${icon(i)}<span>${esc(t)}</span></li>`).join("")}</ul>
   <a class="w-app" href="app.html">${icon("dl")}<span>${esc(L("Get the app for iPhone and Android","حمّل التطبيق لـ iPhone وAndroid"))}</span></a>
   <p class="w-foot">${esc(typeof SUPA!=="undefined"&&SUPA?L("Each company has its own private, encrypted workspace.","لكل منشأة مساحة عمل خاصة ومشفّرة."):L("Data is stored in your company's Google Sheet.","تُحفظ البيانات في جدول Google الخاص بالمنشأة."))}</p></aside>`}function authScreen(){
  const setup=sync.state==="setup",otp=sync.state==="otp";
  const brand=`<div class="auth-brand"><svg viewBox="0 0 40 40" class="logo" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="10" fill="var(--brand)"/><circle cx="18" cy="18" r="8" fill="none" stroke="#fff" stroke-width="3"/><path d="M24 24l7 7" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M14.5 18.5l2.5 2.5 4.5-5" fill="none" stroke="var(--gold-2)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div><div class="wordmark">${LANG==="ar"?"فحص":"Fahs"}</div><div class="tagline slogan-sm">${esc(SLOGAN())}</div></div></div>`;
  const foot=`<div class="row auth-foot"><button type="button" class="btn ghost sm" id="authLang" data-notr>${icon("lang")}${LANG==="ar"?"English":"العربية"}</button><span class="grow"></span><span class="note">${esc(L("Data is stored in your company's Google Sheet.","تُحفظ البيانات في جدول Google الخاص بالمنشأة."))}</span></div>`;
  const ex=authExtraScreen(brand,foot);if(ex)return ex;
  if(otp)return `<div class="auth">${welcomePanel()}<form class="auth-card" id="authForm" autocomplete="off">${brand}
   <h1>${esc(L("Check your email","تحقق من بريدك الإلكتروني"))}</h1>
   <p class="note"><span>${esc(L("We sent a 6-digit sign-in code to","أرسلنا رمز دخول من 6 أرقام إلى"))}</span> <b dir="ltr" data-notr>${esc(AUTH.otpTo||"")}</b>. <span>${esc(L("It expires in 10 minutes.","ينتهي خلال 10 دقائق."))}</span></p>
   <label class="fld"><span>${esc(L("Sign-in code","رمز الدخول"))}</span><input id="aOtp" class="num otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required dir="ltr"></label>
   <p class="auth-err" id="aErr" role="alert">${esc(sync.msg||"")}</p>
   <button class="btn primary" type="submit" id="aGo">${icon("check")}${esc(L("Verify and sign in","تحقق وسجّل الدخول"))}</button>
   <div class="row"><button type="button" class="btn ghost sm" id="aResend">${esc(L("Send a new code","إرسال رمز جديد"))}</button><button type="button" class="btn ghost sm" id="aBack">${esc(L("Back","رجوع"))}</button></div>${foot}</form></div>`;
  return `<div class="auth">${welcomePanel()}<form class="auth-card" id="authForm" autocomplete="on">${brand}
   ${setup?`<h1>${esc(L("Create the administrator account","إنشاء حساب المدير"))}</h1>`:authTabs()}
   ${setup?`<p class="note">${esc(L("First time only. Open your Google Sheet, go to the Users tab and copy the one-time setup code shown at the top.","لمرة واحدة فقط. افتح جدول Google، ثم ورقة Users، وانسخ رمز الإعداد المؤقت الظاهر في الأعلى."))}</p>
    <label class="fld"><span>${esc(L("Setup code","رمز الإعداد"))}</span><input id="aCode" required autocomplete="off" class="num" dir="ltr"></label>
    <label class="fld"><span>${esc(L("Your full name","اسمك الكامل"))}</span><input id="aName" required autocomplete="name"></label>
    <label class="fld"><span>${esc(L("Your email (sign-in codes are sent here)","بريدك الإلكتروني (تُرسل إليه رموز الدخول)"))}</span><input id="aMail" type="email" required autocomplete="email" dir="ltr"></label>`:""}
   <label class="fld"><span>${esc(L("Username","اسم المستخدم"))}</span><input id="aUser" required autocomplete="username" autocapitalize="none" spellcheck="false" dir="ltr"></label>
   <label class="fld"><span>${esc(L("Password","كلمة المرور"))}</span><input id="aPass" type="password" required autocomplete="${setup?"new-password":"current-password"}" dir="ltr"></label>
   ${setup?`<label class="fld"><span>${esc(L("Confirm password","تأكيد كلمة المرور"))}</span><input id="aPass2" type="password" required autocomplete="new-password" dir="ltr"></label><p class="note">${esc(ERR.weak)}</p>`:`<label class="chk"><input type="checkbox" id="aRemember" checked> <span>${esc(L("Keep me signed in on this device","البقاء متصلاً على هذا الجهاز"))}</span></label>`}
   <p class="auth-err" id="aErr" role="alert">${esc(sync.msg||"")}</p>
   <button class="btn primary" type="submit" id="aGo">${icon(setup?"users":"lock")}${esc(setup?L("Create account and continue","إنشاء الحساب والمتابعة"):L("Continue","متابعة"))}</button>
   <p class="note">${esc(L("After your password we email you a 6-digit code.","بعد كلمة المرور نرسل إليك رمزاً من 6 أرقام بالبريد الإلكتروني."))}</p>
   <button type="button" class="btn ghost sm switch" data-as="${setup?"login":"forgot"}">${esc(setup?L("I already have an account – sign in","لدي حساب بالفعل – تسجيل الدخول"):L("Forgot password?","نسيت كلمة المرور؟"))}</button>${foot}</form></div>`;
}
function bindAuth(){
  if(bindAuthExtra())return;
  const f=$("#authForm"),err=$("#aErr"),go=$("#aGo");($("#aOtp")||$("#aCode")||$("#aUser"))?.focus();
  $("#authLang").onclick=()=>{LANG=LANG==="ar"?"en":"ar";try{localStorage.setItem(KEY+"-lang",LANG)}catch(e){}applyLang();render()};
  const busy=on=>{go.disabled=on;go.classList.toggle("busy",on)};
  const toOtp=r=>{AUTH.challenge=r.challenge;AUTH.otpTo=r.to;sync.msg="";sync.state="otp";render()};
  if(sync.state==="otp"){
    $("#aBack").onclick=()=>{AUTH.challenge=null;sync.msg="";sync.state="login";render()};
    $("#aResend").onclick=async()=>{err.textContent="";try{const r=await api("resendOtp",{challenge:AUTH.challenge});if(!r.ok){err.textContent=r.error==="wait"?L(`Please wait ${r.seconds} seconds before asking for a new code.`,`يرجى الانتظار ${r.seconds} ثانية قبل طلب رمز جديد.`):errText(r.error);if(r.error==="expired"){sync.state="login";sync.msg=err.textContent;render()}return}toast(L("A new code has been sent.","تم إرسال رمز جديد."))}catch(x){err.textContent=ERR.net}};
    f.onsubmit=async e=>{e.preventDefault();err.textContent="";busy(true);
      try{const r=await api("verifyOtp",{challenge:AUTH.challenge,code:$("#aOtp").value.trim()});
        if(!r.ok){if(r.error==="expired"){sync.state="login";sync.msg=ERR.expired;render();return}err.textContent=r.error==="badcode"?L(`Wrong code. ${r.left} attempt(s) left.`,`رمز غير صحيح. متبقٍ ${r.left} محاولة.`):errText(r.error);return}
        setToken(r.token,AUTH.remember);AUTH.user=r.user;AUTH.challenge=null;sync.msg="";sync.state="loading";render();loadRemote();
      }catch(x){err.textContent=ERR.net}finally{busy(false)}};
    return;
  }
  const sw=$("#aSwitch");if(sw)sw.onclick=()=>{sync.msg="";sync.state=sync.state==="setup"?"login":"setup";render()};
  f.onsubmit=async e=>{e.preventDefault();err.textContent="";const user=$("#aUser").value.trim().toLowerCase(),pass=$("#aPass").value;busy(true);
    try{
      if(sync.state==="setup"){if(pass!==$("#aPass2").value){err.textContent=ERR.mismatch;return}
        const r=await api("setupAdmin",{setupCode:$("#aCode").value,name:$("#aName").value,email:$("#aMail").value.trim(),username:user,password:pass});
        if(!r.ok){err.textContent=errText(r.error);return}}
      AUTH.remember=sync.state==="setup"||!!$("#aRemember")?.checked;
      const r=await api("login",{username:user,password:pass});
      if(!r.ok){err.textContent=r.error==="locked"?L(`Too many wrong attempts. Try again in ${r.minutes} minutes.`,`محاولات خاطئة كثيرة. حاول مرة أخرى بعد ${r.minutes} دقيقة.`):errText(r.error);return}
      if(r.otp){toOtp(r);return}
      setToken(r.token,AUTH.remember);AUTH.user=r.user;sync.msg="";sync.state="loading";render();loadRemote();
    }catch(x){err.textContent=ERR.net}finally{busy(false)}};
}
// ---------------------------------------------------------------- show / hide password (eye icon)
IC.eye='<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
IC.eyeOff='<path d="M3 3l18 18M10.6 5.1A10.5 10.5 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>';
function addEyes(root){root.querySelectorAll('input[type="password"]').forEach(inp=>{if(inp.parentElement.classList.contains("pw"))return;const w=document.createElement("span");w.className="pw";inp.parentNode.insertBefore(w,inp);w.appendChild(inp);
  const b=document.createElement("button");b.type="button";b.className="eye";b.setAttribute("aria-label",tr(L("Show password","إظهار كلمة المرور")));b.innerHTML=icon("eye");
  b.onclick=()=>{const show=inp.type==="password";inp.type=show?"text":"password";b.innerHTML=icon(show?"eyeOff":"eye");b.setAttribute("aria-label",tr(show?L("Hide password","إخفاء كلمة المرور"):L("Show password","إظهار كلمة المرور")));inp.focus()};w.appendChild(b)})}
const _render0=render;
render=function(){
  if(REMOTE&&["login","setup","otp","signup","forgot","reset"].includes(sync.state)){$("#nav").innerHTML="";$("#main").innerHTML=authScreen();addEyes(document);document.body.classList.add("signed-out");bindAuth();return}
  document.body.classList.remove("signed-out");document.body.classList.toggle("readonly",REMOTE&&!!AUTH.user&&!canEdit());
  const v=VIEWS.find(x=>x.id===cur);if(v&&v.admin&&!isAdmin())cur="dash"; // admin-only pages
  _render0();
  if(REMOTE&&AUTH.user)bindUserMenu();
};

// ---------------------------------------------------------------- top bar: year picker, install, user menu
function yearPicker(){const ys=yearLabels();return `<label class="yearpick">${icon("cal")}<select id="yearSel" aria-label="${esc(tr(L("Inspection year","سنة الفحص")))}">${ys.map(y=>`<option value="${y}"${y===S.year?" selected":""}>${y}</option>`).join("")}<option value="__add">${esc(tr(L("+ Add year","+ إضافة سنة")))}</option><option value="__all">${esc(tr(L("All years overview","نظرة عامة على جميع السنوات")))}</option></select></label>`}
let installEvt=null;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;const b=$("#installBtn");if(b)b.hidden=false});
window.addEventListener("appinstalled",()=>{installEvt=null;const b=$("#installBtn");if(b)b.hidden=true;toast(L("Fahs is installed. Open it from your desktop or start menu.","تم تثبيت «فحص». افتحه من سطح المكتب أو قائمة ابدأ."))});
function userChip(){if(!REMOTE||!AUTH.user)return "";return `<div class="umenu"><button class="btn ghost" id="userBtn" aria-haspopup="true" aria-expanded="false">${icon("users")}<span data-notr>${esc(AUTH.user.name||AUTH.user.username)}</span><span class="role">${esc(roleName(AUTH.user.role))}</span></button>
  <div class="umenu-pop" id="userPop" hidden><div class="umenu-h"><b data-notr>${esc(AUTH.user.username)}</b><span class="note">${esc(roleName(AUTH.user.role))}</span></div>
  ${isAdmin()?`<button class="umenu-i" data-go="users">${icon("users")}${esc(L("Users & access","المستخدمون والصلاحيات"))}</button>`:""}
  <button class="umenu-i" id="pwBtn">${icon("lock")}${esc(L("Change my password","تغيير كلمة المرور"))}</button>
  <button class="umenu-i danger" id="outBtn">${icon("out")}${esc(L("Sign out","تسجيل الخروج"))}</button></div></div>`}
function closeMenus(){document.querySelectorAll(".umenu-pop").forEach(p=>{p.hidden=true});document.querySelectorAll("#userBtn").forEach(b=>b.setAttribute("aria-expanded","false"))}
// one global listener: any click outside the menu, or Esc, closes it
document.addEventListener("click",ev=>{if(!ev.target.closest(".umenu"))closeMenus()});document.addEventListener("keydown",ev=>{if(ev.key==="Escape")closeMenus()});
function bindUserMenu(){
  const ys=$("#yearSel");if(ys)ys.onchange=()=>{const v=ys.value;if(v==="__all"){go("years");return}if(v==="__add"){addYearPrompt();ys.value=S.year;return}switchYear(v);save();render();toast(L(`Now working on ${v}`,`العمل الآن على سنة ${v}`))};
  const ib=$("#installBtn");if(ib){ib.hidden=!installEvt;ib.onclick=async()=>{if(!installEvt)return;installEvt.prompt();await installEvt.userChoice;installEvt=null;ib.hidden=true}}
  const ub=$("#userBtn"),pop=$("#userPop");if(!ub)return;
  ub.onclick=e=>{e.stopPropagation();pop.hidden=!pop.hidden;ub.setAttribute("aria-expanded",String(!pop.hidden))};
  pop.addEventListener("click",ev=>{if(ev.target.closest("button"))closeMenus()});
  pop.querySelector("[data-go]")?.addEventListener("click",()=>go("users"));
  $("#outBtn").onclick=async()=>{try{await api("logout")}catch(e){}signedOut(L("You have signed out.","تم تسجيل الخروج."))};
  const pb=$("#pwBtn");if(pb)pb.onclick=()=>passwordDialog();
}
function formDialog(title,fields,okLabel,onOk){const back=document.createElement("div");back.className="modal-back";
  back.innerHTML=`<form class="modal" role="dialog" aria-modal="true"><h3>${esc(title)}</h3>${fields}<p class="auth-err" id="dErr" role="alert"></p><div class="row end"><button type="button" class="btn" id="dCancel">${esc("Cancel")}</button><button class="btn primary" id="dOk">${esc(okLabel)}</button></div></form>`;
  document.body.appendChild(back);addEyes(back);const f=back.querySelector("form"),err=back.querySelector("#dErr");back.querySelector("#dCancel").onclick=()=>back.remove();f.querySelector("input,select")?.focus();
  f.onsubmit=async e=>{e.preventDefault();err.textContent="";const b=back.querySelector("#dOk");b.disabled=true;try{const msg=await onOk(f);if(msg){err.textContent=msg;return}back.remove()}catch(x){err.textContent=x.message==="auth"?"":ERR.net}finally{b.disabled=false}}}
const pwField=(id,lab,ac="new-password")=>`<label class="fld"><span>${esc(lab)}</span><input id="${id}" type="password" required autocomplete="${ac}" dir="ltr"></label>`;
function passwordDialog(){formDialog(L("Change my password","تغيير كلمة المرور"),pwField("pCur",L("Current password","كلمة المرور الحالية"),"current-password")+pwField("pNew",L("New password","كلمة المرور الجديدة"))+pwField("pNew2",L("Confirm new password","تأكيد كلمة المرور الجديدة"))+`<p class="note">${esc(ERR.weak)}</p>`,L("Change password","تغيير كلمة المرور"),
  async f=>{const n=f.querySelector("#pNew").value;if(n!==f.querySelector("#pNew2").value)return ERR.mismatch;const r=await api("changePassword",{current:f.querySelector("#pCur").value,password:n});if(!r.ok)return errText(r.error);toast(L("Password changed.","تم تغيير كلمة المرور."))})}
function addYearPrompt(){const ys=yearLabels(),last=+ys[ys.length-1]||new Date().getFullYear();
  formDialog(L("Add an inspection year","إضافة سنة فحص"),`<label class="fld"><span>${esc(L("Year","السنة"))}</span><input id="yNew" class="num" inputmode="numeric" required value="${last-ys.length}" dir="ltr"></label><p class="note">${esc(L("Each year keeps its own trial balance, returns, registers and payments. The ZATCA case and checklist are shared.","لكل سنة ميزان مراجعة وإقرارات وسجلات ومدفوعات خاصة بها. ملف الفحص وقائمة المستندات مشتركة."))}</p>`,L("Add year","إضافة السنة"),
  async f=>{const y=f.querySelector("#yNew").value.trim();if(!/^(19|20)\d\d$/.test(y))return L("Enter a year such as 2021.","أدخل سنة مثل 2021.");if(!addYear(y))return L("That year already exists.","هذه السنة موجودة بالفعل.");switchYear(y);save();render();toast(L(`${y} added`,`تمت إضافة ${y}`))})}

// ---------------------------------------------------------------- users & access page (admins)
VIEWS.splice(VIEWS.findIndex(v=>v.id==="setup"),0,{id:"users",t:L("Users & access","المستخدمون والصلاحيات"),i:"users",admin:true});
VIEWS.splice(VIEWS.findIndex(v=>v.id==="case"),0,{id:"years",t:L("All years overview","نظرة عامة على السنوات"),i:"cal"});
let USERS=null;
R.users=C=>{if(!isAdmin())return `<p class="empty">${esc(ERR.forbidden)}</p>`;
  if(!USERS){api("listUsers").then(r=>{USERS=r.ok?r.users:[];if(cur==="users")render()}).catch(()=>{});return `<div class="splash"><div class="spinner"></div></div>`}
  const roleSel=(u,i)=>`<select data-uf="role" data-ui="${i}" ${u.username===AUTH.user.username?"disabled":""}>${Object.keys(ROLE_AR).map(r=>`<option value="${r}"${r===u.role?" selected":""}>${esc(roleName(r))}</option>`).join("")}</select>`;
  return `<p class="lead">${esc(L("Who can open the system and what they can do. Admins manage users; Editors enter and change data; Viewers can only look.","من يمكنه فتح النظام وماذا يمكنه أن يفعل. المدير يدير المستخدمين، والمحرر يُدخل البيانات ويعدّلها، والمشاهد يطّلع فقط."))}</p>
  ${card(L("Users","المستخدمون"),`<div class="frame"><table class="tbl edit"><thead><tr><th>${esc(L("Username","اسم المستخدم"))}</th><th>${esc(L("Name","الاسم"))}</th><th>${esc(L("Email","البريد الإلكتروني"))}</th><th>${esc(L("Role","الصلاحية"))}</th><th>${esc(L("Active","نشط"))}</th><th>${esc(L("Last sign-in","آخر دخول"))}</th><th></th></tr></thead><tbody>
   ${USERS.map((u,i)=>`<tr><td class="mono" data-notr>${esc(u.username)}</td><td><input data-uf="name" data-ui="${i}" value="${esc(u.name)}"></td><td><input data-uf="email" data-ui="${i}" value="${esc(u.email)}" dir="ltr"></td><td>${roleSel(u,i)}</td>
    <td><label class="chk"><input type="checkbox" data-uf="active" data-ui="${i}" ${u.active?"checked":""} ${u.username===AUTH.user.username?"disabled":""} style="min-width:0;width:auto">${u.pending?pill("warn",L("Waiting for approval – tick and Save","بانتظار الموافقة – حدّد ثم احفظ")):""}</label></td><td class="note">${esc(u.lastLogin?showDate(u.lastLogin.slice(0,10)):"—")}</td>
    <td class="row"><button class="btn sm" data-usave="${i}">${esc(L("Save","حفظ"))}</button><button class="btn sm" data-ureset="${i}">${esc(L("Reset password","إعادة تعيين كلمة المرور"))}</button>${u.username!==AUTH.user.username?`<button class="btn sm danger" data-udel="${i}">${esc(L("Remove","حذف"))}</button>`:""}</td></tr>`).join("")}
  </tbody></table></div><div class="row"><button class="btn primary sm" id="uAdd">${icon("users")}${esc(L("Add user","إضافة مستخدم"))}</button></div>`)}
  ${card(L("Roles","الصلاحيات"),`<div class="frame"><table class="tbl"><thead><tr><th>${esc(L("Role","الصلاحية"))}</th><th>${esc(L("Can do","الصلاحيات المتاحة"))}</th></tr></thead><tbody>
   <tr><td><b>${esc(roleName("Admin"))}</b></td><td>${esc(L("Everything, plus add, remove and reset users","كل شيء، بالإضافة إلى إضافة المستخدمين وحذفهم وإعادة تعيين كلمات المرور"))}</td></tr>
   <tr><td><b>${esc(roleName("Editor"))}</b></td><td>${esc(L("Enter, import and change data; record findings and decisions","إدخال البيانات واستيرادها وتعديلها، وتسجيل الملاحظات والقرارات"))}</td></tr>
   <tr><td><b>${esc(roleName("Viewer"))}</b></td><td>${esc(L("View every page and the presentation; cannot change anything","عرض جميع الصفحات والعرض التقديمي دون أي تعديل"))}</td></tr></tbody></table></div>
   <p class="note">${esc(L("Every sign-in and change is recorded with the username in the AuditLog tab of the Google Sheet. Accounts lock for 15 minutes after 5 wrong passwords.","يُسجَّل كل دخول وتغيير مع اسم المستخدم في ورقة AuditLog في جدول Google. يُقفل الحساب 15 دقيقة بعد 5 محاولات خاطئة."))}</p>`)}`};
AFTER.users=()=>{if(!USERS||!isAdmin()||!$("#uAdd"))return;
  const row=i=>{const u={...USERS[i]};document.querySelectorAll(`[data-ui="${i}"]`).forEach(el=>{u[el.dataset.uf]=el.type==="checkbox"?el.checked:el.value});return u};
  const after=r=>{if(!r.ok){toast(errText(r.error));return false}USERS=r.users;render();return true};
  document.querySelectorAll("[data-usave]").forEach(b=>b.onclick=async()=>{const r=await api("saveUser",{user:row(+b.dataset.usave)});if(after(r))toast(L("User saved.","تم حفظ المستخدم."))});
  document.querySelectorAll("[data-udel]").forEach(b=>b.onclick=()=>{const u=USERS[+b.dataset.udel];confirmBox(L(`Remove ${u.username}? They will no longer be able to sign in.`,`حذف ${u.username}؟ لن يتمكن من تسجيل الدخول بعد ذلك.`),L("Remove","حذف"),async()=>{const r=await api("deleteUser",{username:u.username});if(after(r))toast(L("User removed.","تم حذف المستخدم."))})});
  document.querySelectorAll("[data-ureset]").forEach(b=>b.onclick=()=>{const u=row(+b.dataset.ureset);formDialog(L(`Reset password for ${u.username}`,`إعادة تعيين كلمة مرور ${u.username}`),pwField("rNew",L("New password","كلمة المرور الجديدة"))+`<p class="note">${esc(ERR.weak)} ${esc(L("Give it to the user privately; they can change it after signing in.","سلّمها للمستخدم بشكل خاص، ويمكنه تغييرها بعد تسجيل الدخول."))}</p>`,L("Reset password","إعادة تعيين"),async f=>{u.password=f.querySelector("#rNew").value;const r=await api("saveUser",{user:u});if(!r.ok)return errText(r.error);USERS=r.users;render();toast(L("Password reset.","تمت إعادة تعيين كلمة المرور."))})});
  $("#uAdd").onclick=()=>formDialog(L("Add user","إضافة مستخدم"),`<label class="fld"><span>${esc(L("Username","اسم المستخدم"))}</span><input id="nUser" required dir="ltr" autocapitalize="none" spellcheck="false"></label><label class="fld"><span>${esc(L("Full name","الاسم الكامل"))}</span><input id="nName" required></label><label class="fld"><span>${esc(L("Email (sign-in codes are sent here)","البريد الإلكتروني (تُرسل إليه رموز الدخول)"))}</span><input id="nMail" type="email" required dir="ltr"></label><label class="fld"><span>${esc(L("Role","الصلاحية"))}</span><select id="nRole">${Object.keys(ROLE_AR).map(r=>`<option value="${r}"${r==="Editor"?" selected":""}>${esc(roleName(r))}</option>`).join("")}</select></label>${pwField("nPass",L("Temporary password","كلمة مرور مؤقتة"))}<p class="note">${esc(ERR.weak)}</p>`,L("Add user","إضافة المستخدم"),
    async f=>{const r=await api("saveUser",{user:{username:f.querySelector("#nUser").value.trim().toLowerCase(),name:f.querySelector("#nName").value,email:f.querySelector("#nMail").value,role:f.querySelector("#nRole").value,active:true,password:f.querySelector("#nPass").value}});if(!r.ok)return errText(r.error);USERS=r.users;render();toast(L("User added.","تمت إضافة المستخدم."))})};

// ---------------------------------------------------------------- all-years overview
R.years=()=>{const all=computeAllYears(),cur0=S.year;
  const tot=f=>all.reduce((s,x)=>s+f(x.C),0);
  return `<p class="lead">${esc(L("Every year in the inspection side by side. ZATCA can generally assess up to 5 years back, so keep all years in scope here.","جميع سنوات الفحص جنباً إلى جنب. يحق للهيئة عادةً التقييم حتى 5 سنوات سابقة، لذا أبقِ جميع السنوات هنا."))}</p>
  <div class="tiles four">${tile(L("Years in scope","السنوات محل الفحص"),all.length)}${tile(L("Total exposure (SAR)","إجمالي التعرض (ريال)"),`<span class="num">${fmt0(tot(C=>C.exposure.A))}</span>`,"","badv")}${tile(L("With fines initiative (SAR)","مع مبادرة الإعفاء (ريال)"),`<span class="num">${fmt0(tot(C=>C.exposure.B))}</span>`,"","okv")}${tile(L("Open findings","الملاحظات المفتوحة"),tot(C=>C.tests.filter(t=>t.status==="fail").length))}</div>
  ${card(L("Exposure by year","التعرض حسب السنة"),columnChart(all.map(x=>x.y),[{name:L("Without action","دون إجراء"),c:"s2",values:all.map(x=>x.C.exposure.A)},{name:L("With fines initiative","مع مبادرة الإعفاء"),c:"s3",values:all.map(x=>x.C.exposure.B)}]))}
  ${card(L("Years","السنوات"),`<div class="frame"><table class="tbl" id="t-years"><thead><tr><th>${esc(L("Year","السنة"))}</th><th>${esc(L("Filing","الإقرار"))}</th><th class="n">${esc(L("Returns entered","الإقرارات المدخلة"))}</th><th class="n">${esc("Total sales")}</th><th class="n">${esc("Output VAT")}</th><th class="n">${esc("Input VAT")}</th><th class="n">${esc(L("Score","المؤشر"))}</th><th class="n">${esc(L("Findings","الملاحظات"))}</th><th class="n">${esc(L("Exposure","التعرض"))}</th><th class="n">${esc(L("With initiative","مع المبادرة"))}</th><th></th></tr></thead><tbody>
   ${all.map(({y,C})=>`<tr${y===cur0?' class="total"':""}><td><b>${y}</b></td><td>${esc(C.ps.length===4?"Quarterly":"Monthly")}</td><td class="n">${C.rets.filter(r=>r.entered).length} / ${C.ps.length}</td>${nc(C.rets.reduce((s,r)=>s+r.box6,0))}${nc(C.rets.reduce((s,r)=>s+r.out,0))}${nc(C.rets.reduce((s,r)=>s+r.inp,0))}<td class="n">${C.score==null?"–":C.score}</td><td class="n">${C.tests.filter(t=>t.status==="fail").length}</td>${nc(C.exposure.A,C.exposure.A>0)}${nc(C.exposure.B)}<td class="row">${y===cur0?pill("ok",L("Open now","مفتوحة الآن")):`<button class="btn sm" data-yopen="${y}">${esc(L("Open","فتح"))}</button>`}${y!==cur0&&!withYear(y,()=>S.tb.length||S.sales.length||S.purchases.length||C.rets.some(r=>r.entered))?`<button class="btn sm danger" data-ydel="${y}">${esc(L("Remove","حذف"))}</button>`:""}</td></tr>`).join("")}
   <tr class="total"><td>${esc(L("All years","جميع السنوات"))}</td><td></td><td></td>${nc(tot(C=>C.rets.reduce((s,r)=>s+r.box6,0)))}${nc(tot(C=>C.rets.reduce((s,r)=>s+r.out,0)))}${nc(tot(C=>C.rets.reduce((s,r)=>s+r.inp,0)))}<td></td><td class="n">${tot(C=>C.tests.filter(t=>t.status==="fail").length)}</td>${nc(tot(C=>C.exposure.A))}${nc(tot(C=>C.exposure.B))}<td></td></tr></tbody></table></div>
   <div class="row">${canEdit()?`<button class="btn primary sm" id="yAdd">${icon("cal")}${esc(L("Add year","إضافة سنة"))}</button><button class="btn sm" id="yFive">${esc(L("Set up 5 years","إعداد 5 سنوات"))}</button>`:""}<button class="btn sm" data-copy="t-years">${esc("Copy table")}</button></div>`)}`};
AFTER.years=()=>{document.querySelectorAll("[data-yopen]").forEach(b=>b.onclick=()=>{switchYear(b.dataset.yopen);save();go("dash")});
  document.querySelectorAll("[data-ydel]").forEach(b=>b.onclick=()=>confirmBox(L(`Remove ${b.dataset.ydel}? It has no data.`,`حذف ${b.dataset.ydel}؟ لا توجد بها بيانات.`),L("Remove","حذف"),()=>{removeYear(b.dataset.ydel);save();render()}));
  $("#yAdd")&&($("#yAdd").onclick=addYearPrompt);
  $("#yFive")&&($("#yFive").onclick=()=>{const top=Math.max(...yearLabels().map(Number));let n=0;for(let y=top-4;y<=top;y++)if(addYear(String(y)))n++;save();render();toast(L(`${n} year(s) added`,`تمت إضافة ${n} سنة`))})};

// ---------------------------------------------------------------- installable app (service worker)
if("serviceWorker" in navigator&&location.protocol==="https:")window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
