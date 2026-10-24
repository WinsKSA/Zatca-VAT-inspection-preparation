/**
 * Fahs – VAT Inspection Command Center
 * Google Apps Script backend (JSON API). The Google Sheet this script is attached to is the database:
 * one tab per dataset, a Users tab (accounts and roles), and an AuditLog tab that records every change.
 *
 * The web app itself is served from GitHub Pages and calls this API with POST requests.
 * Every data request needs a session token obtained by logging in with a username and password.
 */

var SHEET_ID_DEFAULT = '1JqnO-aklZgaagnqMnJek738tgmFuZlGTl7sxPWFCnMY';
var APP_URL = 'https://winsksa.github.io/Zatca-VAT-inspection-preparation/';

// Dataset key (used by the web app) -> tab name in the Google Sheet.
var TABS = {
  meta: 'Meta', setup: 'Settings', 'case': 'InspectionCase', sample: 'SamplingSettings',
  tb: 'TrialBalance', returns: 'VATReturns', sales: 'SalesRegister', purchases: 'PurchaseRegister',
  payments: 'ZATCAPayments', requests: 'ZATCARequests', checklist: 'DocumentChecklist',
  recItems: 'ReconcilingItems', decisions: 'FindingDecisions', vouch: 'SampleVouching', years: 'Years'
};
var LOG_TAB = 'AuditLog';
var USERS_TAB = 'Users';
var USER_COLS = ['username', 'name', 'email', 'role', 'active', 'salt', 'hash', 'created', 'lastLogin', 'failed', 'lockedUntil'];
var ROLES = { Admin: 3, Editor: 2, Viewer: 1 };
var SESSION_HOURS = 6, MAX_FAILED = 5, LOCK_MINUTES = 15, HASH_ROUNDS = 1500;

// ---------------------------------------------------------------- entry points
function doGet() {
  // The app lives on GitHub Pages; this URL only forwards there.
  return HtmlService.createHtmlOutput('<meta http-equiv="refresh" content="0;url=' + APP_URL + '"><a href="' + APP_URL + '">Open Fahs</a>')
    .setTitle('Fahs – VAT Inspection Command Center');
}

function doPost(e) {
  var out;
  try {
    var req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    out = route_(req);
  } catch (err) {
    out = { ok: false, error: 'server', message: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function route_(req) {
  var a = req.action;
  if (a === 'status') return status_();
  if (a === 'setupAdmin') return setupAdmin_(req);
  if (a === 'login') return login_(req);
  if (a === 'verifyOtp') return verifyOtp_(req);
  if (a === 'resendOtp') return resendOtp_(req);
  if (a === 'signup') return signup_(req);
  if (a === 'forgot') return forgot_(req);
  if (a === 'resetPassword') return resetPassword_(req);
  var s = session_(req.token);
  if (!s) return { ok: false, error: 'auth' };
  if (a === 'logout') { CacheService.getScriptCache().remove('s:' + req.token); return { ok: true }; }
  if (a === 'me') return { ok: true, user: publicUser_(findUser_(s.u)) };
  if (a === 'load') return load_(s);
  if (a === 'save') return need_(s, 'Editor') || save_(s, req.payload);
  if (a === 'changePassword') return changePassword_(s, req);
  if (a === 'listUsers') return need_(s, 'Admin') || { ok: true, users: readUsers_().map(publicUser_) };
  if (a === 'saveUser') return need_(s, 'Admin') || saveUser_(s, req.user);
  if (a === 'deleteUser') return need_(s, 'Admin') || deleteUser_(s, req.username);
  return { ok: false, error: 'unknown' };
}

// ---------------------------------------------------------------- sheet helpers
function sheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || SHEET_ID_DEFAULT;
  return SpreadsheetApp.openById(id);
}
function log_(ss, who, what, rows) {
  var log = ss.getSheetByName(LOG_TAB) || ss.insertSheet(LOG_TAB);
  if (log.getLastRow() === 0) log.appendRow(['Timestamp', 'User', 'Action', 'Rows written']);
  log.appendRow([new Date(), who, what, rows || 0]);
}
function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { return fn(); } finally { lock.releaseLock(); }
}

// ---------------------------------------------------------------- users & passwords
function usersSheet_() {
  var ss = sheet_(), sh = ss.getSheetByName(USERS_TAB);
  if (!sh) {
    sh = ss.insertSheet(USERS_TAB);
    sh.getRange(1, 1, 1, USER_COLS.length).setValues([USER_COLS]).setFontWeight('bold').setBackground('#e1f1ed');
    sh.setFrozenRows(1);
  }
  return sh;
}
function readUsers_() {
  var sh = usersSheet_(), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, USER_COLS.length).getValues().filter(function (r) { return r[0] !== ''; }).map(function (r) {
    var o = {}; USER_COLS.forEach(function (c, i) { o[c] = r[i]; }); o.username = String(o.username).toLowerCase(); return o;
  });
}
function writeUsers_(users) {
  var sh = usersSheet_();
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, USER_COLS.length).clearContent();
  if (users.length) {
    var range = sh.getRange(2, 1, users.length, USER_COLS.length);
    range.setNumberFormat('@');
    range.setValues(users.map(function (u) { return USER_COLS.map(function (c) { return u[c] == null ? '' : String(u[c]); }); }));
  }
}
function findUser_(username) {
  username = String(username || '').trim().toLowerCase();
  return readUsers_().filter(function (u) { return u.username === username; })[0] || null;
}
function publicUser_(u) {
  if (!u) return null;
  return { username: u.username, name: u.name, email: u.email, role: u.role, active: String(u.active) === 'yes', pending: String(u.active) === 'pending', lastLogin: String(u.lastLogin || '') };
}
function hash_(password, salt) {
  var h = salt + '|' + password;
  for (var i = 0; i < HASH_ROUNDS; i++) {
    h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + '|' + salt, Utilities.Charset.UTF_8));
  }
  return h;
}
function newSalt_() { return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Math.random())); }
function validPassword_(p) { return typeof p === 'string' && p.length >= 8 && /[A-Za-z]/.test(p) && /[0-9]/.test(p); }
function validUsername_(u) { return typeof u === 'string' && /^[a-z0-9._-]{3,32}$/.test(u); }

// ---------------------------------------------------------------- first run: create the administrator
function status_() {
  var hasUsers = readUsers_().length > 0;
  if (!hasUsers) setupCode_(); // make sure a setup code exists in the Users tab
  return { ok: true, needsSetup: !hasUsers };
}
function setupCode_() {
  var props = PropertiesService.getScriptProperties(), code = props.getProperty('SETUP_CODE');
  if (!code) {
    code = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
    props.setProperty('SETUP_CODE', code);
  }
  var sh = usersSheet_();
  sh.getRange(1, USER_COLS.length + 2).setValue('One-time setup code (needed to create the first administrator):');
  sh.getRange(1, USER_COLS.length + 3).setValue(code).setFontWeight('bold');
  return code;
}
function setupAdmin_(req) {
  return withLock_(function () {
    if (readUsers_().length) return { ok: false, error: 'exists' };
    var code = PropertiesService.getScriptProperties().getProperty('SETUP_CODE');
    if (!code || String(req.setupCode || '').trim().toUpperCase() !== code) return { ok: false, error: 'code' };
    var username = String(req.username || '').trim().toLowerCase();
    if (!validUsername_(username)) return { ok: false, error: 'username' };
    if (!validPassword_(req.password)) return { ok: false, error: 'weak' };
    if (!validEmail_(req.email)) return { ok: false, error: 'email' };
    var salt = newSalt_();
    writeUsers_([{ username: username, name: req.name || username, email: String(req.email).trim(), role: 'Admin', active: 'yes', salt: salt, hash: hash_(req.password, salt), created: new Date().toISOString(), lastLogin: '', failed: '0', lockedUntil: '' }]);
    PropertiesService.getScriptProperties().deleteProperty('SETUP_CODE');
    var sh = usersSheet_(); sh.getRange(1, USER_COLS.length + 2, 1, 2).clearContent();
    log_(sheet_(), username, 'Administrator account created', 0);
    return { ok: true };
  });
}

// ---------------------------------------------------------------- login & sessions
function login_(req) {
  return withLock_(function () {
    var users = readUsers_(), username = String(req.username || '').trim().toLowerCase();
    var u = users.filter(function (x) { return x.username === username; })[0];
    var now = Date.now();
    if (!u) { Utilities.sleep(400); return { ok: false, error: 'invalid' }; }
    if (String(u.active) === 'pending') return { ok: false, error: 'pending' };
    if (String(u.active) !== 'yes') { Utilities.sleep(400); return { ok: false, error: 'invalid' }; }
    if (u.lockedUntil && now < Number(u.lockedUntil)) return { ok: false, error: 'locked', minutes: Math.ceil((Number(u.lockedUntil) - now) / 60000) };
    if (hash_(String(req.password || ''), u.salt) !== u.hash) {
      u.failed = String(Number(u.failed || 0) + 1);
      if (Number(u.failed) >= MAX_FAILED) { u.lockedUntil = String(now + LOCK_MINUTES * 60000); u.failed = '0'; }
      writeUsers_(users);
      Utilities.sleep(400);
      return { ok: false, error: Number(u.lockedUntil) > now ? 'locked' : 'invalid', minutes: LOCK_MINUTES };
    }
    u.failed = '0'; u.lockedUntil = '';
    writeUsers_(users);
    // Password is right: step 2 is a one-time code sent by email.
    if (!validEmail_(u.email)) return { ok: false, error: 'noemail' };
    var challenge = Utilities.getUuid();
    var sent = sendOtp_(u, challenge);
    if (!sent.ok) return sent;
    return { ok: true, otp: true, challenge: challenge, to: maskEmail_(u.email), minutes: OTP_MINUTES };
  });
}

// ---------------------------------------------------------------- one-time codes by email
var OTP_MINUTES = 10, OTP_TRIES = 5, OTP_RESEND_SECONDS = 60;
function validEmail_(e) { return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); }
function maskEmail_(e) { var p = String(e).split('@'); return p[0].slice(0, 2) + '***@' + p[1]; }
function sendOtp_(u, challenge) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid());
  var n = ((bytes[0] & 255) * 16777216 + (bytes[1] & 255) * 65536 + (bytes[2] & 255) * 256 + (bytes[3] & 255)) % 1000000;
  var code = ('00000' + n).slice(-6);
  var salt = newSalt_();
  CacheService.getScriptCache().put('c:' + challenge, JSON.stringify({ u: u.username, h: hash_(code, salt), s: salt, tries: 0, sent: Date.now() }), OTP_MINUTES * 60);
  try {
    MailApp.sendEmail({
      to: String(u.email).trim(),
      subject: 'Fahs sign-in code: ' + code + ' | رمز الدخول إلى فحص',
      body: 'Your Fahs sign-in code is ' + code + '. It expires in ' + OTP_MINUTES + ' minutes.\n' +
            'رمز الدخول إلى نظام فحص هو ' + code + ' وينتهي خلال ' + OTP_MINUTES + ' دقائق.\n\n' +
            'If you did not try to sign in, change your password. / إذا لم تحاول تسجيل الدخول فغيّر كلمة المرور.',
      htmlBody: '<div style="font-family:Arial,sans-serif;font-size:15px;color:#0f1c1a">' +
        '<p>Your <b>Fahs</b> sign-in code:</p><p style="font-size:30px;letter-spacing:6px;font-weight:bold;color:#0b6b5f">' + code + '</p>' +
        '<p>It expires in ' + OTP_MINUTES + ' minutes.</p><hr><div dir="rtl"><p>رمز الدخول إلى نظام <b>فحص</b>:</p><p style="font-size:30px;letter-spacing:6px;font-weight:bold;color:#0b6b5f">' + code + '</p>' +
        '<p>ينتهي خلال ' + OTP_MINUTES + ' دقائق.</p></div><p style="color:#74827f;font-size:12px">If you did not try to sign in, change your password. / إذا لم تحاول تسجيل الدخول فغيّر كلمة المرور.</p></div>',
      name: 'Fahs VAT Inspection'
    });
  } catch (err) {
    return { ok: false, error: 'mail', message: String(err && err.message || err) };
  }
  log_(sheet_(), u.username, 'Sign-in code sent to ' + maskEmail_(u.email), 0);
  return { ok: true };
}
function verifyOtp_(req) {
  var cache = CacheService.getScriptCache(), raw = cache.get('c:' + req.challenge);
  if (!raw) return { ok: false, error: 'expired' };
  var c = JSON.parse(raw);
  if (hash_(String(req.code || '').trim(), c.s) !== c.h) {
    c.tries++;
    if (c.tries >= OTP_TRIES) { cache.remove('c:' + req.challenge); return { ok: false, error: 'expired' }; }
    cache.put('c:' + req.challenge, JSON.stringify(c), OTP_MINUTES * 60);
    Utilities.sleep(300);
    return { ok: false, error: 'badcode', left: OTP_TRIES - c.tries };
  }
  cache.remove('c:' + req.challenge);
  return withLock_(function () {
    var users = readUsers_(), u = users.filter(function (x) { return x.username === c.u; })[0];
    if (!u || String(u.active) !== 'yes') return { ok: false, error: 'invalid' };
    u.lastLogin = new Date().toISOString(); writeUsers_(users);
    var token = Utilities.getUuid() + Utilities.getUuid();
    cache.put('s:' + token, JSON.stringify({ u: u.username, r: u.role }), SESSION_HOURS * 3600);
    log_(sheet_(), u.username, 'Signed in (password + email code)', 0);
    return { ok: true, token: token, user: publicUser_(u), hours: SESSION_HOURS };
  });
}
function resendOtp_(req) {
  var raw = CacheService.getScriptCache().get('c:' + req.challenge);
  if (!raw) return { ok: false, error: 'expired' };
  var c = JSON.parse(raw);
  if (Date.now() - c.sent < OTP_RESEND_SECONDS * 1000) return { ok: false, error: 'wait', seconds: Math.ceil((OTP_RESEND_SECONDS * 1000 - (Date.now() - c.sent)) / 1000) };
  var u = findUser_(c.u);
  if (!u) return { ok: false, error: 'invalid' };
  var s = sendOtp_(u, req.challenge);
  return s.ok ? { ok: true, to: maskEmail_(u.email) } : s;
}
// ---------------------------------------------------------------- sign up (needs admin approval) and forgotten password
function signup_(req) {
  return withLock_(function () {
    var users = readUsers_(), username = String(req.username || '').trim().toLowerCase();
    if (!users.length) return { ok: false, error: 'nosetup' };
    if (!validUsername_(username)) return { ok: false, error: 'username' };
    if (!validEmail_(req.email)) return { ok: false, error: 'email' };
    if (!validPassword_(req.password)) return { ok: false, error: 'weak' };
    if (users.some(function (x) { return x.username === username; })) return { ok: false, error: 'taken' };
    var salt = newSalt_();
    users.push({ username: username, name: req.name || username, email: String(req.email).trim(), role: 'Viewer', active: 'pending', salt: salt, hash: hash_(req.password, salt), created: new Date().toISOString(), lastLogin: '', failed: '0', lockedUntil: '' });
    writeUsers_(users);
    log_(sheet_(), username, 'Requested access (waiting for admin approval)', 0);
    try { // tell the administrators
      users.filter(function (x) { return x.role === 'Admin' && String(x.active) === 'yes' && validEmail_(x.email); }).forEach(function (a) {
        MailApp.sendEmail({ to: a.email, name: 'Fahs VAT Inspection', subject: 'Fahs: ' + username + ' asked for access | طلب وصول جديد',
          body: (req.name || username) + ' (' + username + ', ' + req.email + ') asked for access to Fahs. Approve or remove them in Users & access: ' + APP_URL +
                '\n\nطلب ' + (req.name || username) + ' الوصول إلى نظام فحص. يمكنك الموافقة أو الحذف من صفحة المستخدمين والصلاحيات.' });
      });
    } catch (e) {}
    return { ok: true, pending: true };
  });
}
function forgot_(req) {
  var u = findUser_(req.username);
  // same answer whether or not the user exists, so usernames can't be probed
  if (!u || String(u.active) !== 'yes' || !validEmail_(u.email)) { Utilities.sleep(500); return { ok: true, challenge: Utilities.getUuid(), to: '' }; }
  var challenge = Utilities.getUuid(), sent = sendOtp_(u, challenge);
  if (!sent.ok) return sent;
  CacheService.getScriptCache().put('r:' + challenge, u.username, OTP_MINUTES * 60);
  return { ok: true, challenge: challenge, to: maskEmail_(u.email) };
}
function resetPassword_(req) {
  var cache = CacheService.getScriptCache(), who = cache.get('r:' + req.challenge), raw = cache.get('c:' + req.challenge);
  if (!who || !raw) return { ok: false, error: 'expired' };
  var c = JSON.parse(raw);
  if (hash_(String(req.code || '').trim(), c.s) !== c.h) {
    c.tries++;
    if (c.tries >= OTP_TRIES) { cache.remove('c:' + req.challenge); cache.remove('r:' + req.challenge); return { ok: false, error: 'expired' }; }
    cache.put('c:' + req.challenge, JSON.stringify(c), OTP_MINUTES * 60);
    return { ok: false, error: 'badcode', left: OTP_TRIES - c.tries };
  }
  if (!validPassword_(req.password)) return { ok: false, error: 'weak' };
  cache.remove('c:' + req.challenge); cache.remove('r:' + req.challenge);
  return withLock_(function () {
    var users = readUsers_(), u = users.filter(function (x) { return x.username === who; })[0];
    if (!u) return { ok: false, error: 'invalid' };
    u.salt = newSalt_(); u.hash = hash_(req.password, u.salt); u.failed = '0'; u.lockedUntil = '';
    writeUsers_(users); log_(sheet_(), u.username, 'Reset own password with an email code', 0);
    return { ok: true };
  });
}

/** Run once from the Apps Script editor to approve sending email (sends nothing). */
function authorize() { MailApp.getRemainingDailyQuota(); return 'Email sending is authorised.'; }
function session_(token) {
  if (!token) return null;
  var cache = CacheService.getScriptCache(), raw = cache.get('s:' + token);
  if (!raw) return null;
  var s = JSON.parse(raw), u = findUser_(s.u);
  if (!u || String(u.active) !== 'yes') { cache.remove('s:' + token); return null; }
  s.r = u.role; // roles changed by an admin take effect immediately
  cache.put('s:' + token, JSON.stringify(s), SESSION_HOURS * 3600); // sliding expiry
  return s;
}
function need_(s, role) { return (ROLES[s.r] || 0) >= ROLES[role] ? null : { ok: false, error: 'forbidden' }; }
function changePassword_(s, req) {
  return withLock_(function () {
    var users = readUsers_(), u = users.filter(function (x) { return x.username === s.u; })[0];
    if (!u || hash_(String(req.current || ''), u.salt) !== u.hash) return { ok: false, error: 'invalid' };
    if (!validPassword_(req.password)) return { ok: false, error: 'weak' };
    u.salt = newSalt_(); u.hash = hash_(req.password, u.salt);
    writeUsers_(users); log_(sheet_(), s.u, 'Changed own password', 0);
    return { ok: true };
  });
}
function saveUser_(s, user) {
  return withLock_(function () {
    if (!user) return { ok: false, error: 'invalid' };
    var users = readUsers_(), username = String(user.username || '').trim().toLowerCase();
    if (!validUsername_(username)) return { ok: false, error: 'username' };
    if (!ROLES[user.role]) return { ok: false, error: 'role' };
    if (!validEmail_(user.email)) return { ok: false, error: 'email' }; // needed for the sign-in code
    var u = users.filter(function (x) { return x.username === username; })[0], isNew = !u;
    if (isNew) {
      if (!validPassword_(user.password)) return { ok: false, error: 'weak' };
      u = { username: username, created: new Date().toISOString(), failed: '0', lockedUntil: '', lastLogin: '' };
      users.push(u);
    }
    if (!isNew && username === s.u && user.role !== 'Admin') return { ok: false, error: 'self' }; // cannot demote yourself
    u.name = user.name || username; u.email = user.email || ''; u.role = user.role; u.active = user.active === false ? 'no' : 'yes';
    if (username === s.u) u.active = 'yes';
    if (user.password) {
      if (!validPassword_(user.password)) return { ok: false, error: 'weak' };
      u.salt = newSalt_(); u.hash = hash_(user.password, u.salt); u.failed = '0'; u.lockedUntil = '';
    }
    if (!users.some(function (x) { return x.role === 'Admin' && String(x.active) === 'yes'; })) return { ok: false, error: 'lastAdmin' };
    writeUsers_(users);
    log_(sheet_(), s.u, (isNew ? 'Added user ' : 'Updated user ') + username + ' (' + u.role + ')' + (user.password && !isNew ? ', password reset' : ''), 0);
    return { ok: true, users: users.map(publicUser_) };
  });
}
function deleteUser_(s, username) {
  return withLock_(function () {
    username = String(username || '').toLowerCase();
    if (username === s.u) return { ok: false, error: 'self' };
    var users = readUsers_().filter(function (x) { return x.username !== username; });
    if (!users.some(function (x) { return x.role === 'Admin' && String(x.active) === 'yes'; })) return { ok: false, error: 'lastAdmin' };
    writeUsers_(users); log_(sheet_(), s.u, 'Removed user ' + username, 0);
    return { ok: true, users: users.map(publicUser_) };
  });
}

// ---------------------------------------------------------------- data
function load_(s) {
  var t0 = Date.now(), ss = sheet_(), data = {}, present = {};
  ss.getSheets().forEach(function (sh) { present[sh.getName()] = true; });
  var keys = Object.keys(TABS).filter(function (k) { return present[TABS[k]]; });
  var nonEmpty = function (r) { return r.some(function (c) { return c !== '' && c != null; }); };
  var put = function (k, v) {
    if (!v || !v.length) return;
    data[k] = { headers: v[0].map(String), rows: v.slice(1).filter(nonEmpty).map(function (r) { return r.map(function (c) { return c == null ? '' : String(c); }); }) };
  };
  var fast = false;
  if (keys.length && typeof Sheets !== 'undefined') {
    try {
      var res = Sheets.Spreadsheets.Values.batchGet(ss.getId(), { ranges: keys.map(function (k) { return "'" + TABS[k] + "'"; }), valueRenderOption: 'FORMATTED_VALUE' });
      (res.valueRanges || []).forEach(function (vr, i) { put(keys[i], vr.values); });
      fast = true;
    } catch (e) { data = {}; }
  }
  if (!fast) keys.forEach(function (k) { var sh = ss.getSheetByName(TABS[k]); if (sh && sh.getLastRow() > 0) put(k, sh.getDataRange().getDisplayValues()); });
  return { ok: true, empty: !data.meta, data: data, sheetUrl: ss.getUrl(), user: publicUser_(findUser_(s.u)), ms: Date.now() - t0 };
}
function save_(s, payload) {
  return withLock_(function () {
    var ss = sheet_(), saved = [], rowsWritten = 0;
    Object.keys(payload || {}).forEach(function (k) {
      if (!TABS.hasOwnProperty(k)) return;
      var t = payload[k];
      if (!t || !Array.isArray(t.headers) || !Array.isArray(t.rows)) return;
      writeTable_(ss, TABS[k], t.headers, t.rows);
      saved.push(TABS[k]); rowsWritten += t.rows.length;
    });
    if (saved.length) { removeDefaultSheet_(ss); log_(ss, s.u, 'Saved ' + saved.join(', '), rowsWritten); }
    SpreadsheetApp.flush();
    return { ok: true, saved: saved };
  });
}
function writeTable_(ss, name, headers, rows) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name), width = headers.length;
  var values = [headers].concat(rows).map(function (r) { var o = []; for (var i = 0; i < width; i++) o.push(r[i] == null ? '' : String(r[i])); return o; });
  sh.clearContents();
  var range = sh.getRange(1, 1, values.length, width);
  range.setNumberFormat('@');
  range.setValues(values);
  sh.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#e1f1ed');
  sh.setFrozenRows(1);
  var extra = sh.getMaxRows() - values.length;
  if (extra > 200) sh.deleteRows(values.length + 1, extra - 100);
}
function removeDefaultSheet_(ss) {
  var known = {}; Object.keys(TABS).forEach(function (k) { known[TABS[k]] = true; }); known[LOG_TAB] = true; known[USERS_TAB] = true;
  ss.getSheets().forEach(function (sh) {
    var name = sh.getName();
    if (!known[name] && /^(Sheet|الورقة|Hoja|Feuille|Blatt)\s?1$/.test(name) && sh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });
}
