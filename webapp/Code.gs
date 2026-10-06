/**
 * Fahs – VAT Inspection Command Center
 * Google Apps Script backend. The Google Sheet this script is attached to is the database:
 * one tab per dataset, plus an AuditLog tab that records every save.
 */

// Dataset key (used by the web app) -> tab name in the Google Sheet.
var TABS = {
  meta: 'Meta', setup: 'Settings', 'case': 'InspectionCase', sample: 'SamplingSettings',
  tb: 'TrialBalance', returns: 'VATReturns', sales: 'SalesRegister', purchases: 'PurchaseRegister',
  payments: 'ZATCAPayments', requests: 'ZATCARequests', checklist: 'DocumentChecklist',
  recItems: 'ReconcilingItems', decisions: 'FindingDecisions', vouch: 'SampleVouching'
};
var LOG_TAB = 'AuditLog';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Fahs – VAT Inspection Command Center')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/** Run once from the editor: records the spreadsheet, creates the tabs and asks for permissions. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  Object.keys(TABS).forEach(function (k) { if (!ss.getSheetByName(TABS[k])) ss.insertSheet(TABS[k]); });
  if (!ss.getSheetByName(LOG_TAB)) {
    var log = ss.insertSheet(LOG_TAB);
    log.appendRow(['Timestamp', 'User', 'Datasets saved', 'Rows written']);
    log.setFrozenRows(1);
    log.getRange(1, 1, 1, 4).setFontWeight('bold');
  }
  removeDefaultSheet_(ss);
  return 'Setup complete: ' + ss.getUrl();
}

function sheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

/** Returns every dataset as {headers, rows} of strings. */
function loadState() {
  var ss = sheet_(), data = {};
  Object.keys(TABS).forEach(function (k) {
    var sh = ss.getSheetByName(TABS[k]);
    if (!sh || sh.getLastRow() === 0) return;
    var v = sh.getDataRange().getDisplayValues();
    data[k] = {
      headers: v[0],
      rows: v.slice(1).filter(function (r) { return r.some(function (c) { return c !== ''; }); })
    };
  });
  return { empty: !data.meta, data: data, sheetUrl: ss.getUrl(), user: currentUser_() };
}

/** Saves the datasets that changed. payload = {key: {headers: [...], rows: [[...]]}} */
function saveCollections(payload) {
  var lock = LockService.getDocumentLock() || LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = sheet_(), saved = [], rowsWritten = 0;
    Object.keys(payload || {}).forEach(function (k) {
      if (!TABS.hasOwnProperty(k)) return; // only known datasets
      var t = payload[k];
      if (!t || !Array.isArray(t.headers) || !Array.isArray(t.rows)) return;
      writeTable_(ss, TABS[k], t.headers, t.rows);
      saved.push(TABS[k]);
      rowsWritten += t.rows.length;
    });
    if (saved.length) {
      removeDefaultSheet_(ss);
      var log = ss.getSheetByName(LOG_TAB) || ss.insertSheet(LOG_TAB);
      if (log.getLastRow() === 0) log.appendRow(['Timestamp', 'User', 'Datasets saved', 'Rows written']);
      log.appendRow([new Date(), currentUser_(), saved.join(', '), rowsWritten]);
    }
    SpreadsheetApp.flush();
    return { ok: true, saved: saved };
  } finally {
    lock.releaseLock();
  }
}

function writeTable_(ss, name, headers, rows) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  var width = headers.length;
  var values = [headers].concat(rows).map(function (r) {
    var out = [];
    for (var i = 0; i < width; i++) out.push(r[i] == null ? '' : String(r[i]));
    return out;
  });
  sh.clearContents();
  var range = sh.getRange(1, 1, values.length, width);
  range.setNumberFormat('@'); // keep everything as text so dates and numbers round-trip exactly
  range.setValues(values);
  sh.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#e1f1ed');
  sh.setFrozenRows(1);
  var extra = sh.getMaxRows() - values.length;
  if (extra > 200) sh.deleteRows(values.length + 1, extra - 100);
}

/** Deletes Google's empty starter tab (named "Sheet1" or its translation, e.g. "الورقة1"). */
function removeDefaultSheet_(ss) {
  var known = {};
  Object.keys(TABS).forEach(function (k) { known[TABS[k]] = true; });
  known[LOG_TAB] = true;
  ss.getSheets().forEach(function (sh) {
    var name = sh.getName();
    if (!known[name] && /^(Sheet|الورقة|Hoja|Feuille|Blatt)\s?1$/.test(name) && sh.getLastRow() === 0 && ss.getSheets().length > 1) {
      ss.deleteSheet(sh);
    }
  });
}

function currentUser_() {
  try { return Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || ''; }
  catch (e) { return ''; }
}
