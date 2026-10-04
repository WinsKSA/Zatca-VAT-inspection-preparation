# ZATCA VAT Inspection Preparation

Tools to prepare for a ZATCA (Saudi Arabia) VAT inspection: monthly trial balance, VAT returns as filed, sales and purchase registers, all the reconciliations ZATCA usually asks for, penalty estimates and a document checklist.

أدوات للاستعداد لفحص هيئة الزكاة والضريبة والجمارك لضريبة القيمة المضافة: ميزان المراجعة الشهري، الإقرارات كما قُدمت، سجلات المبيعات والمشتريات، جميع المطابقات التي تطلبها الهيئة عادةً، تقدير الغرامات، وقائمة المستندات. التطبيق يدعم اللغتين العربية والإنجليزية.

| File | What it is |
|---|---|
| `vat-inspection-desk.html` | Browser app in **Arabic and English** (switch at the top of the menu). Open it in any modern browser. Everything runs locally, so your figures stay on your computer. |
| `ZATCA_VAT_Inspection_Pack.xlsx` | Excel workbook with the same logic as formulas (14 linked sheets, VAT return boxes labelled in Arabic and English). Needs Excel 2007 or newer, Excel Online or Google Sheets. |
| `build_zatca_pack.py` | Python script that generates the workbook (`pip install openpyxl`, then `python build_zatca_pack.py`). |

## What's covered

- **Trial balance:** monthly movements with a VAT mapping for each account and a balance check.
- **VAT returns:** Boxes 1–16 exactly as filed, recalculated and checked for arithmetic, late filing and the SAR 5,000 limit on Box 14.
- **Sales register:** flags wrong VAT, invalid customer VAT numbers, missing export or zero-rate evidence, invoices not reported to FATOORA, and credit-note errors.
- **Purchase register:** separates defensible input VAT from VAT at risk (no valid tax invoice, blocked expenses, invalid supplier VAT number, missing customs declaration, reverse charge misuse).
- **Reconciliations:** sales by VAT box (return vs register vs trial balance), annual revenue vs returns, output VAT, input VAT (including Box 8 customs and Box 9 reverse charge), and the VAT control account against payments.
- **Penalties:** estimated late-payment penalties, plus indicative exposure under the 50% incorrect-return penalty.
- **Checklist and guide:** 38 documents ZATCA typically requests, what ZATCA tests, common findings, and the key rules.

## How to use

1. Open `vat-inspection-desk.html` in a browser. It starts with example data for January 2025. Click **Clear example data** to start fresh.
2. Set the company, the year under inspection and the filing frequency.
3. Paste your data from Excel into each table, or fill in the Excel workbook and use **Import my Excel workbook**.
4. Work through every ✗ on the reconciliation pages and write an explanation for each difference.
5. Use **Copy table** to paste results into Excel for your submission file.

## Disclaimer

Rules and penalty rates are summarised from the KSA VAT Law and Implementing Regulations. Exposure figures are indicative estimates. Confirm current rules with ZATCA or a qualified tax advisor before relying on them.
