// ================================================================ SaaS screens: sign-in by email code, companies, team, platform console
IC.building='<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3"/>';
IC.shield='<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>';
let SIGN={email:"",name:"",mode:"login",how:"pw"};
function supaScreen(){
  const st=sync.state,brand=`<div class="auth-brand"><svg viewBox="0 0 40 40" class="logo" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="10" fill="var(--brand)"/><circle cx="18" cy="18" r="8" fill="none" stroke="#fff" stroke-width="3"/><path d="M24 24l7 7" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M14.5 18.5l2.5 2.5 4.5-5" fill="none" stroke="var(--gold-2)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div><div class="wordmark">${LANG==="ar"?"فحص":"Fahs"}</div><div class="tagline">${esc(L("VAT inspection command center","مركز قيادة فحص ضريبة القيمة المضافة"))}</div></div></div>`;
  const foot=`<div class="row auth-foot"><button type="button" class="btn ghost sm" id="authLang" data-notr>${icon("lang")}${LANG==="ar"?"English":"العربية"}</button><span class="grow"></span><span class="note">${esc(L("Each company's data is private to its own team.","بيانات كل منشأة خاصة بفريقها فقط."))}</span></div>`;
  const err=`<p class="auth-err" id="aErr" role="alert">${esc(sync.msg||"")}</p>`;
  const wrap=(inner,ac="on")=>`<div class="auth">${welcomePanel()}<form class="auth-card" id="authForm" autocomplete="${ac}">${brand}${inner}${foot}</form></div>`;
  const tabs=`<div class="auth-tabs" role="tablist"><button type="button" role="tab" data-mode="login" aria-selected="${SIGN.mode==="login"}">${esc(L("Sign in","تسجيل الدخول"))}</button><button type="button" role="tab" data-mode="signup" aria-selected="${SIGN.mode==="signup"}">${esc(L("Sign up","إنشاء حساب"))}</button></div>`;
  if(st==="login")return wrap(`${tabs}
    <p class="note">${esc(SIGN.mode==="signup"?L("Create your account with your work email. Then create your company, or join one you were invited to.","أنشئ حسابك ببريد العمل، ثم أنشئ منشأتك أو انضم إلى منشأة دُعيت إليها."):L("Sign in with your email and password, or ask for a sign-in link by email.","سجّل الدخول ببريدك وكلمة المرور، أو اطلب رابط دخول بالبريد."))}</p>
    ${SIGN.mode==="signup"?`<label class="fld"><span>${esc(L("Full name","الاسم الكامل"))}</span><input id="sName" required autocomplete="name" value="${esc(SIGN.name)}"></label>`:""}
    <label class="fld"><span>${esc(L("Email","البريد الإلكتروني"))}</span><input id="sMail" type="email" required autocomplete="email" dir="ltr" value="${esc(SIGN.email)}"></label>
    <div class="seg how" role="radiogroup" aria-label="${esc(L("How to sign in","طريقة الدخول"))}"><button type="button" data-how="pw" aria-pressed="${SIGN.how==="pw"}">${esc(L("Password","كلمة المرور"))}</button><button type="button" data-how="link" aria-pressed="${SIGN.how==="link"}">${esc(L("Email link","رابط بالبريد"))}</button></div>
    ${SIGN.how==="pw"?`<label class="fld"><span>${esc(L("Password","كلمة المرور"))}</span><input id="sPass" type="password" required minlength="8" autocomplete="${SIGN.mode==="signup"?"new-password":"current-password"}" dir="ltr"></label>
     ${SIGN.mode==="signup"?`<p class="note">${esc(L("At least 8 characters. We'll email a link once to confirm your address.","8 أحرف على الأقل. سنرسل رابطاً مرة واحدة لتأكيد بريدك."))}</p>`:`<button type="button" class="btn ghost sm switch" id="aForgot">${esc(L("Forgot password?","نسيت كلمة المرور؟"))}</button>`}`:`<p class="note">${esc(L("We'll email you a secure sign-in link. No password needed.","سنرسل إليك رابط دخول آمناً بالبريد. لا حاجة لكلمة مرور."))}</p>`}${err}
    <button class="btn primary" type="submit" id="aGo">${icon("lock")}${esc(SIGN.how==="pw"?(SIGN.mode==="signup"?L("Create account","إنشاء الحساب"):L("Sign in","تسجيل الدخول")):L("Email me a sign-in link","أرسل لي رابط الدخول"))}</button>`);
  if(st==="setpw")return wrap(`<h1>${esc(L("Set a new password","تعيين كلمة مرور جديدة"))}</h1>
    <p class="note">${esc(L("Choose a password of at least 8 characters. You can then sign in with it on the web and in the mobile app.","اختر كلمة مرور من 8 أحرف على الأقل، ثم استخدمها للدخول من الويب ومن تطبيق الجوال."))}</p>
    <label class="fld"><span>${esc(L("New password","كلمة المرور الجديدة"))}</span><input id="nPass" type="password" required minlength="8" autocomplete="new-password" dir="ltr"></label>
    <label class="fld"><span>${esc(L("Confirm new password","تأكيد كلمة المرور الجديدة"))}</span><input id="nPass2" type="password" required minlength="8" autocomplete="new-password" dir="ltr"></label>${err}
    <button class="btn primary" type="submit" id="aGo">${icon("lock")}${esc(L("Save password","حفظ كلمة المرور"))}</button>`,"off");
  if(st==="otp")return wrap(`<h1>${esc(L("Check your email","تحقق من بريدك الإلكتروني"))}</h1>
    <p class="note"><span>${esc(L("We sent a sign-in email to","أرسلنا رسالة دخول إلى"))}</span> <b dir="ltr" data-notr>${esc(SIGN.email)}</b>.</p>
    <ol class="steps-mini"><li>${esc(L("Open the email from Supabase Auth (check Spam/Junk too).","افتح الرسالة الواردة من Supabase Auth (وتحقق من مجلد الرسائل غير المرغوب فيها)."))}</li><li>${esc(L("Click the sign-in link. This page opens signed in.","اضغط رابط الدخول، وستفتح هذه الصفحة وأنت مسجّل الدخول."))}</li></ol>
    <p class="note">${esc(L("If the email shows a code instead, enter it here:","إذا ظهر في الرسالة رمز بدلاً من الرابط فأدخله هنا:"))}</p>
    <label class="fld"><span>${esc(L("Sign-in code","رمز الدخول"))}</span><input id="aOtp" class="num otp" inputmode="numeric" autocomplete="one-time-code" maxlength="8" required dir="ltr"></label>${err}
    <button class="btn primary" type="submit" id="aGo">${icon("check")}${esc(L("Verify and sign in","تحقق وسجّل الدخول"))}</button>
    <div class="row"><button type="button" class="btn ghost sm" id="aResend">${esc(L("Send again","إعادة الإرسال"))}</button><button type="button" class="btn ghost sm" id="aBack">${esc(L("Use another email","استخدام بريد آخر"))}</button></div>`,"off");
  if(st==="newco")return wrap(`<h1>${esc(L("Create your company","أنشئ منشأتك"))}</h1>
    <p class="note">${esc(L("Your company gets its own private workspace. You become its owner and can invite your team. If someone invited you, ask them to add this email, then sign in again.","تحصل منشأتك على مساحة عمل خاصة، وتصبح مالكها ويمكنك دعوة فريقك. إذا دعاك أحد، فاطلب منه إضافة هذا البريد ثم سجّل الدخول مرة أخرى."))}</p>
    <label class="fld"><span>${esc("Company name")}</span><input id="cName" required></label>
    <label class="fld"><span>${esc("VAT registration number")}</span><input id="cVat" class="num" inputmode="numeric" maxlength="15" dir="ltr"></label>
    <label class="fld"><span>${esc("Commercial registration no")}</span><input id="cCr" class="num" dir="ltr"></label>${err}
    <button class="btn primary" type="submit" id="aGo">${icon("building")}${esc(L("Create company","إنشاء المنشأة"))}</button>
    <button type="button" class="btn ghost sm switch" id="aOut">${esc(L("Sign out","تسجيل الخروج"))}</button>`);
  if(st==="pick")return wrap(`<h1>${esc(L("Choose a company","اختر المنشأة"))}</h1>
    <div class="co-list">${COMPANIES.map(c=>`<button type="button" class="co" data-co="${c.id}">${icon("building")}<span><b data-notr>${esc(c.name)}</b><small class="num">${esc(c.vat_number||"")}</small></span><span class="role">${esc(roleLabel(c.role))}</span></button>`).join("")}</div>${err}
    <div class="row"><button type="button" class="btn sm" id="aNew">${icon("building")}${esc(L("New company","منشأة جديدة"))}</button><span class="grow"></span><button type="button" class="btn ghost sm" id="aOut">${esc(L("Sign out","تسجيل الخروج"))}</button></div>`);
  return null;
}
function bindSupa(){
  const f=$("#authForm"),err=$("#aErr"),go=$("#aGo");const busy=on=>{if(go){go.disabled=on;go.classList.toggle("busy",on)}};
  $("#authLang").onclick=()=>{LANG=LANG==="ar"?"en":"ar";try{localStorage.setItem(KEY+"-lang",LANG)}catch(e){}applyLang();render()};
  document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{SIGN.mode=b.dataset.mode;SIGN.email=$("#sMail")?.value||SIGN.email;sync.msg="";render()});
  const out=$("#aOut");if(out)out.onclick=()=>signedOut("");
  const send=async()=>{const {error}=await sbc().auth.signInWithOtp({email:SIGN.email,options:{shouldCreateUser:true,emailRedirectTo:location.origin+location.pathname,data:SIGN.name?{full_name:SIGN.name}:undefined}});if(error)throw error};
  const st=sync.state;($("#aOtp")||$("#nPass")||$("#cName")||$("#sName")||$("#sMail"))?.focus();
  if(typeof addEyes==="function")addEyes(document);
  document.querySelectorAll("[data-how]").forEach(b=>b.onclick=()=>{SIGN.how=b.dataset.how;SIGN.email=$("#sMail")?.value||SIGN.email;SIGN.name=$("#sName")?.value||SIGN.name;sync.msg="";render()});
  const fg=$("#aForgot");if(fg)fg.onclick=async()=>{err.textContent="";SIGN.email=$("#sMail").value.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SIGN.email)){err.textContent=SERR.email;return}
    try{const {error}=await sbc().auth.resetPasswordForEmail(SIGN.email,{redirectTo:location.origin+location.pathname});if(error)throw error;sync.msg=L("We emailed you a link to set a new password.","أرسلنا إليك رابطاً لتعيين كلمة مرور جديدة.");render()}catch(x){err.textContent=sbErr(x)}};
  if(st==="pick"){document.querySelectorAll("[data-co]").forEach(b=>b.onclick=()=>openCompany(COMPANIES.find(c=>c.id===b.dataset.co)));$("#aNew").onclick=()=>{sync.state="newco";render()};return}
  if(st==="otp"){$("#aBack").onclick=()=>{sync.state="login";sync.msg="";render()};
    $("#aResend").onclick=async()=>{err.textContent="";try{await send();toast(L("Sent again. Check your inbox.","تمت إعادة الإرسال. تحقق من بريدك."))}catch(e){err.textContent=sbErr(e)}}}
  f.onsubmit=async e=>{e.preventDefault();err.textContent="";busy(true);
    try{
      if(st==="login"){SIGN.email=$("#sMail").value.trim().toLowerCase();SIGN.name=$("#sName")?.value.trim()||"";if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SIGN.email)){err.textContent=SERR.email;return}
        if(SIGN.how==="pw"){const pw=$("#sPass").value;if(pw.length<8){err.textContent=L("Use at least 8 characters.","استخدم 8 أحرف على الأقل.");return}
          if(SIGN.mode==="signup"){const {data,error}=await sbc().auth.signUp({email:SIGN.email,password:pw,options:{emailRedirectTo:location.origin+location.pathname,data:SIGN.name?{full_name:SIGN.name}:undefined}});if(error)throw error;
            if(data.session){await afterSignIn(data.session);return}
            SIGN.mode="login";sync.msg=L("Account created. Open the confirmation email we sent, then sign in with your password.","تم إنشاء الحساب. افتح رسالة التأكيد التي أرسلناها ثم سجّل الدخول بكلمة المرور.");render();return}
          const {data,error}=await sbc().auth.signInWithPassword({email:SIGN.email,password:pw});
          if(error){err.textContent=/invalid login/i.test(error.message)?L("Wrong email or password. If you have never set a password, sign in with the email link first, then set one from the menu.","البريد أو كلمة المرور غير صحيحة. إذا لم تعيّن كلمة مرور من قبل فادخل برابط البريد أولاً ثم عيّنها من القائمة."):/not confirmed/i.test(error.message)?L("Confirm your email first: open the link we emailed you.","أكّد بريدك أولاً: افتح الرابط الذي أرسلناه إليك."):sbErr(error);return}
          sync.msg="";await afterSignIn(data.session);return}
        await send();sync.state="otp";sync.msg="";render();return}
      if(st==="setpw"){const a=$("#nPass").value;if(a.length<8){err.textContent=L("Use at least 8 characters.","استخدم 8 أحرف على الأقل.");return}if(a!==$("#nPass2").value){err.textContent=L("The passwords don't match.","كلمتا المرور غير متطابقتين.");return}
        const {error}=await sbc().auth.updateUser({password:a});if(error)throw error;toast(L("Password saved.","تم حفظ كلمة المرور."));sync.msg="";await afterSignIn((await sbc().auth.getSession()).data.session);return}
      if(st==="otp"){const {data,error}=await sbc().auth.verifyOtp({email:SIGN.email,token:$("#aOtp").value.trim(),type:"email"});if(error)throw error;
        if(SIGN.name)sbc().from("profiles").update({full_name:SIGN.name}).eq("user_id",data.user.id).then(()=>{});
        sync.msg="";await afterSignIn(data.session);return}
      if(st==="newco"){const {data,error}=await sbc().rpc("create_company",{p_name:$("#cName").value.trim(),p_vat:$("#cVat").value.trim()||null,p_cr:$("#cCr").value.trim()||null});if(error)throw error;
        try{localStorage.setItem(KEY+"-company",data)}catch(x){}await afterSignIn((await sbc().auth.getSession()).data.session);toast(L("Company created. Welcome!","تم إنشاء المنشأة. أهلاً بك!"));return}
    }catch(x){err.textContent=sbErr(x)}finally{busy(false)}};
}
if(SUPA){
  const _renderAuth=render;
  render=function(){
    if(["login","otp","newco","pick","setpw"].includes(sync.state)){$("#nav").innerHTML="";$("#main").innerHTML=supaScreen();document.body.classList.add("signed-out");bindSupa();return}
    if(sync.state==="loading"&&!COMPANY){$("#nav").innerHTML="";document.body.classList.add("signed-out");$("#main").innerHTML=`<div class="splash"><div class="spinner"></div><p>${esc(L("Opening your workspace…","جارٍ فتح مساحة العمل…"))}</p></div>`;return}
    _renderAuth();
  };
  // views: Team replaces "Users & access"; Platform console for the SaaS owner
  const ui=VIEWS.findIndex(v=>v.id==="users");if(ui>=0)VIEWS.splice(ui,1,{id:"team",t:L("Team & access","الفريق والصلاحيات"),i:"users"});
  VIEWS.splice(VIEWS.findIndex(v=>v.id==="setup")+1,0,{id:"platform",t:L("Platform console","لوحة المنصة"),i:"shield",platform:true});
  const _fil=VIEWS.filter;VIEWS.filter=function(fn){return _fil.call(this,v=>(!v.platform||PLATFORM)&&fn(v))};
  // account menu: company switcher instead of password tools
  userChip=function(){if(!AUTH.user)return "";return `<div class="umenu"><button class="btn ghost" id="userBtn" aria-haspopup="true" aria-expanded="false">${icon("building")}<span data-notr>${esc(COMPANY?COMPANY.name:"")}</span><span class="role">${esc(roleLabel(COMPANY?COMPANY.role:""))}</span></button>
    <div class="umenu-pop" id="userPop" hidden><div class="umenu-h"><b data-notr dir="ltr">${esc(AUTH.user.email)}</b><span class="note">${esc(roleLabel(COMPANY?COMPANY.role:""))} · <span data-notr>${esc(COMPANY?COMPANY.name:"")}</span></span></div>
    ${COMPANIES.length>1||true?`<button class="umenu-i" id="coSwitch">${icon("building")}${esc(L("Switch or create company","تبديل المنشأة أو إنشاء أخرى"))}</button>`:""}
    <button class="umenu-i" id="pwSet">${icon("lock")}${esc(L("Set or change password","تعيين أو تغيير كلمة المرور"))}</button>
    <button class="umenu-i" id="teamGo">${icon("users")}${esc(L("Team & access","الفريق والصلاحيات"))}</button>
    ${PLATFORM?`<button class="umenu-i" id="platGo">${icon("shield")}${esc(L("Platform console","لوحة المنصة"))}</button>`:""}
    <button class="umenu-i danger" id="outBtn">${icon("out")}${esc(L("Sign out","تسجيل الخروج"))}</button></div></div>`};
  const _bum=bindUserMenu;bindUserMenu=function(){_bum();
    const sw=$("#coSwitch");if(sw)sw.onclick=()=>{closeMenus();COMPANY=null;sync.state="pick";render()};
    const tg=$("#teamGo");if(tg)tg.onclick=()=>{closeMenus();go("team")};const pg=$("#platGo");if(pg)pg.onclick=()=>{closeMenus();go("platform")};
    const ps=$("#pwSet");if(ps)ps.onclick=()=>{closeMenus();formDialog(L("Set or change password","تعيين أو تغيير كلمة المرور"),pwField("pNew",L("New password","كلمة المرور الجديدة"))+pwField("pNew2",L("Confirm new password","تأكيد كلمة المرور الجديدة"))+`<p class="note">${esc(L("At least 8 characters. Use it to sign in on the web and in the mobile app.","8 أحرف على الأقل. استخدمها للدخول من الويب ومن تطبيق الجوال."))}</p>`,L("Save password","حفظ كلمة المرور"),
      async f=>{const n=f.querySelector("#pNew").value;if(n.length<8)return L("Use at least 8 characters.","استخدم 8 أحرف على الأقل.");if(n!==f.querySelector("#pNew2").value)return L("The passwords don't match.","كلمتا المرور غير متطابقتين.");const {error}=await sbc().auth.updateUser({password:n});if(error)return sbErr(error);toast(L("Password saved.","تم حفظ كلمة المرور."))})};
    const ob=$("#outBtn");if(ob)ob.onclick=()=>{closeMenus();signedOut(L("You have signed out.","تم تسجيل الخروج."))}};
  // when signed in through the emailed link
  sbc().auth.onAuthStateChange((ev,session)=>{if(ev==="PASSWORD_RECOVERY"){sync.state="setpw";sync.msg="";render();return}if(ev==="SIGNED_IN"&&session&&!COMPANY&&["login","otp"].includes(sync.state))afterSignIn(session)});
}

// ---------------------------------------------------------------- Team & access page
R.team=C=>{if(!COMPANY)return "";
  if(!TEAM){sbc().rpc("company_team",{p_company:COMPANY.id}).then(({data,error})=>{TEAM=error?[]:data;if(cur==="team")render()});return `<div class="splash"><div class="spinner"></div></div>`}
  const mgr=isAdmin();
  return `<p class="lead">${esc(L("Everyone who can open this company's workspace. Owners and admins invite people and set roles. Each company's data is visible only to its own team.","كل من يمكنه فتح مساحة عمل هذه المنشأة. يدعو المالك والمدير الأشخاص ويحددون الصلاحيات. بيانات كل منشأة مرئية لفريقها فقط."))}</p>
  ${card(L("Team","الفريق"),`<div class="frame"><table class="tbl edit"><thead><tr><th>${esc(L("Email","البريد الإلكتروني"))}</th><th>${esc(L("Name","الاسم"))}</th><th>${esc(L("Role","الصلاحية"))}</th><th>${esc(L("Status","الحالة"))}</th><th></th></tr></thead><tbody>
   ${TEAM.map((m,i)=>`<tr><td dir="ltr" data-notr>${esc(m.email)}</td><td data-notr>${esc(m.full_name||"")}</td>
    <td>${mgr&&m.role!=="owner"&&m.user_id&&m.email!==AUTH.user.email?`<select data-trole="${i}">${["admin","editor","viewer"].map(r=>`<option value="${r}"${r===m.role?" selected":""}>${esc(roleLabel(r))}</option>`).join("")}</select>`:esc(roleLabel(m.role))}</td>
    <td>${m.pending?pill("warn",L("Invited – not signed up yet","مدعو – لم يسجّل بعد")):pill("ok",L("Active","نشط"))}</td>
    <td>${mgr&&m.role!=="owner"&&m.user_id&&m.email!==AUTH.user.email?`<button class="btn sm danger" data-tdel="${i}">${esc(L("Remove","حذف"))}</button>`:""}</td></tr>`).join("")}
  </tbody></table></div>`)}
  ${mgr?card(L("Invite someone","دعوة شخص"),`<form class="form-grid" id="invForm"><label class="fld"><span>${esc(L("Email","البريد الإلكتروني"))}</span><input id="iMail" type="email" required dir="ltr"></label>
    <label class="fld"><span>${esc(L("Role","الصلاحية"))}</span><select id="iRole">${["editor","viewer","admin"].map(r=>`<option value="${r}">${esc(roleLabel(r))}</option>`).join("")}</select></label>
    <div class="fld"><span>&nbsp;</span><button class="btn primary">${icon("users")}${esc(L("Invite","دعوة"))}</button></div></form>
    <p class="note">${esc(L("Tell them to open the app and sign up with this exact email. They join automatically.","اطلب منهم فتح التطبيق والتسجيل بنفس البريد الإلكتروني تماماً، وسينضمون تلقائياً."))} <b dir="ltr">${esc(location.origin+location.pathname)}</b></p>`):""}
  ${card(L("Roles","الصلاحيات"),`<div class="frame"><table class="tbl"><tbody>
   <tr><td><b>${esc(roleLabel("owner"))}</b></td><td>${esc(L("Created the company. Everything, including managing the team.","أنشأ المنشأة. كل الصلاحيات بما فيها إدارة الفريق."))}</td></tr>
   <tr><td><b>${esc(roleLabel("admin"))}</b></td><td>${esc(L("Everything, including inviting people and changing roles.","كل الصلاحيات بما فيها دعوة الأشخاص وتغيير الصلاحيات."))}</td></tr>
   <tr><td><b>${esc(roleLabel("editor"))}</b></td><td>${esc(L("Enter, import and change data; record findings.","إدخال البيانات واستيرادها وتعديلها وتسجيل الملاحظات."))}</td></tr>
   <tr><td><b>${esc(roleLabel("viewer"))}</b></td><td>${esc(L("View everything, including the presentation. Cannot change anything.","عرض كل شيء بما فيه العرض التقديمي دون أي تعديل."))}</td></tr></tbody></table></div>`)}`};
AFTER.team=()=>{if(!TEAM)return;
  const refresh=()=>{TEAM=null;render()};
  document.querySelectorAll("[data-trole]").forEach(s=>s.onchange=async()=>{const m=TEAM[+s.dataset.trole];const {error}=await sbc().rpc("set_member_role",{p_company:COMPANY.id,p_user:m.user_id,p_role:s.value});toast(error?sbErr(error):L("Role updated.","تم تحديث الصلاحية."));refresh()});
  document.querySelectorAll("[data-tdel]").forEach(b=>b.onclick=()=>{const m=TEAM[+b.dataset.tdel];confirmBox(L(`Remove ${m.email} from ${COMPANY.name}?`,`حذف ${m.email} من ${COMPANY.name}؟`),L("Remove","حذف"),async()=>{const {error}=await sbc().rpc("remove_member",{p_company:COMPANY.id,p_user:m.user_id});toast(error?sbErr(error):L("Removed.","تم الحذف."));refresh()})});
  const f=$("#invForm");if(f)f.onsubmit=async e=>{e.preventDefault();const {error}=await sbc().rpc("invite_member",{p_company:COMPANY.id,p_email:$("#iMail").value.trim(),p_role:$("#iRole").value});toast(error?sbErr(error):L("Invitation saved.","تم حفظ الدعوة."));if(!error)refresh()};
};

// ---------------------------------------------------------------- Platform console (SaaS owner)
R.platform=()=>{if(!PLATFORM)return `<p class="empty">${esc(SERR.forbidden)}</p>`;
  if(!PLAT){sbc().rpc("platform_companies").then(({data,error})=>{PLAT=error?[]:data;if(cur==="platform")render()});return `<div class="splash"><div class="spinner"></div></div>`}
  const act=PLAT.filter(c=>c.status==="active").length,users=PLAT.reduce((s,c)=>s+Number(c.members||0),0);
  return `<p class="lead">${esc(L("Every company on the platform. Company data itself stays private to each company; this console shows only accounts and activity.","جميع المنشآت على المنصة. تبقى بيانات كل منشأة خاصة بها؛ تعرض هذه اللوحة الحسابات والنشاط فقط."))}</p>
  <div class="tiles four">${tile(L("Companies","المنشآت"),PLAT.length)}${tile(L("Active","نشطة"),act,"","okv")}${tile(L("Suspended","موقوفة"),PLAT.length-act,"",PLAT.length-act?"badv":"")}${tile(L("Users","المستخدمون"),users)}</div>
  ${card(L("Companies","المنشآت"),`<div class="frame"><table class="tbl" id="t-plat"><thead><tr><th>${esc(L("Company","المنشأة"))}</th><th>${esc("VAT no")}</th><th>${esc(L("Owner","المالك"))}</th><th class="n">${esc(L("Users","المستخدمون"))}</th><th>${esc(L("Created","تاريخ الإنشاء"))}</th><th>${esc(L("Last activity","آخر نشاط"))}</th><th>${esc(L("Status","الحالة"))}</th><th></th></tr></thead><tbody>
   ${PLAT.map((c,i)=>`<tr><td data-notr><b>${esc(c.name)}</b></td><td class="mono">${esc(c.vat_number||"")}</td><td dir="ltr" data-notr>${esc(c.owner_email||"")}</td><td class="n">${c.members}</td><td>${esc(showDate(String(c.created_at).slice(0,10)))}</td><td>${c.last_activity?esc(showDate(String(c.last_activity).slice(0,10))):"—"}</td>
    <td>${c.status==="active"?pill("ok",L("Active","نشطة")):pill("bad",L("Suspended","موقوفة"))}</td><td><button class="btn sm ${c.status==="active"?"danger":""}" data-pstat="${i}">${esc(c.status==="active"?L("Suspend","إيقاف"):L("Activate","تفعيل"))}</button></td></tr>`).join("")||`<tr><td colspan="8" class="empty">${esc(L("No companies yet.","لا توجد منشآت بعد."))}</td></tr>`}
  </tbody></table></div><div class="row"><button class="btn sm" data-copy="t-plat">${esc("Copy table")}</button></div>`)}`};
AFTER.platform=()=>{if(!PLAT)return;document.querySelectorAll("[data-pstat]").forEach(b=>b.onclick=()=>{const c=PLAT[+b.dataset.pstat],to=c.status==="active"?"suspended":"active";
  confirmBox(to==="suspended"?L(`Suspend ${c.name}? Its team can still view but cannot change data.`,`إيقاف ${c.name}؟ يمكن لفريقها العرض دون تعديل البيانات.`):L(`Activate ${c.name}?`,`تفعيل ${c.name}؟`),to==="suspended"?L("Suspend","إيقاف"):L("Activate","تفعيل"),async()=>{const {error}=await sbc().rpc("platform_set_status",{p_company:c.id,p_status:to});toast(error?sbErr(error):L("Done.","تم."));PLAT=null;render()})})};
