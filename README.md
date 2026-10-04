# Fahs – VAT Inspection Command Center (فحص)

A web app to prepare for a ZATCA (Saudi Arabia) VAT inspection, in **Arabic and English**, with **Google Sheets as the database**.

نظام ويب للاستعداد لفحص هيئة الزكاة والضريبة والجمارك لضريبة القيمة المضافة، بالعربية والإنجليزية، مع جداول Google كقاعدة بيانات.

## What it does

- **Command center:** compliance score, exposure with and without ZATCA's fines initiative, response deadline, status by period, top findings.
- **Inspection case:** the ZATCA notice and a log of every ZATCA request with its deadline.
- **Test library:** 39 automated tests on 100% of your data (sales, purchases, returns, ledger, anomaly analytics including Benford's law), modelled on the Big Four VAT analytics tools and ZATCA's risk triggers.
- **Reconciliations:** sales by VAT box, revenue vs returns, output VAT, input VAT (Box 8/9), VAT control account and penalties.
- **Sampling:** monetary-unit sampling with vouching status.
- **Findings & exposure:** findings register with decisions and explanations; tax and penalties in two scenarios.
- **Response pack:** the 38-item document checklist ZATCA usually requests.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the research behind the design.

## Files

| File | What it is |
|---|---|
| `webapp/Code.gs`, `webapp/Index.html`, `webapp/appsscript.json` | The Google Apps Script web app. Data is saved in your Google Sheet, one tab per dataset, with an audit log. **[How to deploy (10 minutes)](DEPLOY.md)** |
| `index.html` | The same app as a standalone page (saves in the browser). Works on GitHub Pages or opened locally. |
| `ZATCA_VAT_Inspection_Pack.xlsx` / `_AR.xlsx` | Excel workbooks (English / Arabic) with the same reconciliations as formulas. The app imports either one. |
| `build_zatca_pack.py`, `translate_to_arabic.py` | Scripts that generate the workbooks. |

## Quick start

- **With Google Sheets:** follow [DEPLOY.md](DEPLOY.md).
- **Without setup:** open `index.html` in Chrome or Edge, or enable GitHub Pages for this repository (Settings → Pages → branch `main`, folder `/root`) and open `https://<owner>.github.io/Zatca-VAT-inspection-preparation/`.

## Disclaimer

Rules and penalty rates are summarised from the KSA VAT Law, its Implementing Regulations and ZATCA announcements (fines initiative extended to 31 December 2026). Exposure figures are indicative estimates. Confirm current rules with ZATCA or a qualified tax advisor before relying on them.
