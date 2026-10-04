# Fahs – VAT Inspection Command Center: research and architecture

## 1. Research: how the leading firms and ZATCA approach VAT reviews

| Source | What the system does | What we take from it |
|---|---|---|
| **KPMG AVA / Tax Intelligence Solution** | Pulls invoice data from the ERP, runs analytics to isolate risky transactions, predicts mis-booked invoices (claimed 97% accuracy at 100,000 invoices/hour), then a tax expert validates every prediction. | Test the **whole population**, not a sample. Every automated hit goes to a **human review decision**. |
| **Deloitte Global VAT/GST Radar + myInsight Indirect Tax Compliance** | A library of **predefined checks and balances** on VAT data, a central dashboard of risks and opportunities, and an **issue log** with standard management reporting. | A numbered **test library** with legal references, one dashboard, and a **findings register** (issue log). |
| **EY Global VAT Reporting Tool (GVRT)** | Uploads data from several systems, runs parameter tests and **anomaly detection**, has a tax calendar, partial exemption, and an audit trail for returns. | Data hub with quality checks, anomaly tests (Benford, round amounts, spikes), deadline tracking. |
| **PwC Indirect Tax Edge / VAT Data Check / VAT Insights** | Controls testing across **100% of transactional data with 200+ compliance and data-quality checks**; clusters invoice flows between parties. | Separate **data-quality** tests from **tax** tests; group by area; report value at risk per test. |
| **BDO (KSA/UAE)** | Outsourced VAT compliance with automated return preparation (ONESOURCE Fast VAT) and periodic health checks. | Return-level controls: arithmetic, timeliness, box-to-ledger tie-outs. |
| **ZATCA audit practice** | Risk selection by analytics: mismatches between returns and transactions, frequent amendments, large refunds, e-invoicing data inconsistencies, related parties. Desk or field audit, at least 20 days' notice, document requests, follow-up queries, then assessment, objection and committees. E-invoice data is compared with returns in the back end. | The system mirrors ZATCA's own risk triggers, so you see what ZATCA sees first. A **case file** tracks the notice, every request and every deadline. |

Key regulatory fact found in the research: ZATCA's **Cancellation of Fines and Exemption of Financial Penalties initiative** has been extended to **31 December 2026**. It covers late registration, late filing, late payment and VAT return correction penalties for returns due before 30 June 2026, provided all returns are filed and the principal tax is paid. It does not cover evasion penalties or Article 45 penalties. The exposure model shows both scenarios.

Sources: KPMG AVA (kpmg.com/dk), KPMG indirect tax analytics (kpmg.com/il), Deloitte Indirect Tax Compliance (deloitte.com), EY GVRT (ey.com), PwC Indirect Tax Edge (pwc.co.uk), PwC VAT Data Check (store.pwc.de), BDO case study (mena.thomsonreuters.com), ZATCA audit guidance coverage (vatupdate.com, expandway.sa), ZATCA fines initiative (spa.gov.sa, kpmg.com/sa).

## 2. Design principles

1. **100% population testing.** Every invoice and every period is tested; nothing is sampled for detection.
2. **Detect → decide → document.** Automated tests raise findings; a person records a decision (correct, defend, disclose) and an explanation; the evidence goes into the response pack.
3. **See what ZATCA sees.** Tests are modelled on ZATCA's known risk triggers.
4. **Quantify everything.** Each finding carries tax at risk, penalty at risk, and whether the fines initiative can remove the penalty.
5. **Private by default.** All processing runs in the browser. Nothing is uploaded.
6. **Bilingual.** Arabic (RTL) and English, switchable at any time.

## 3. Architecture

```
            ┌────────────────────────── Browser (single file, no server) ──────────────────────────┐
 Excel/CSV  │  DATA HUB            ENGINE                         WORKFLOW            OUTPUT         │
 paste  ───►│  TB · Returns ──►  Period builder                  Case file &         Command        │
 workbook   │  Sales · Purch     Reconciliations (5)    ──►      request log    ──►  center         │
 import     │  Payments          Test library (35+)              Findings register    Response pack  │
            │  Quality checks    Exposure model (2 scenarios)    Sampling (MUS)       Copy to Excel  │
            │                    Benford / anomaly analytics                                         │
            │  localStorage (per browser)  ·  i18n layer (AR/EN, RTL)                                │
            └────────────────────────────────────────────────────────────────────────────────────────┘
```

### Modules

| Module | Purpose |
|---|---|
| **Command center** | Compliance score, exposure in both scenarios, response deadline, status matrix by period, top findings, charts. |
| **Case file** | ZATCA notice details (desk/field, received date, response due), a log of every ZATCA request with due dates and status. |
| **Data hub** | Status of every dataset, row counts, quality checks, import. |
| **Data entry** | Trial balance, VAT returns (ZATCA form layout), sales register, purchase register, payments. |
| **Test library** | 35+ automated tests in five areas (sales, purchases, returns, ledger, anomalies), each with an ID, severity, legal reference, hit count, value at risk and a drill-down. |
| **Reconciliations** | Sales by box, revenue vs returns, output VAT, input VAT (incl. Box 8/9), VAT control account. |
| **Sampling** | Monetary-unit sampling from the registers with a fixed seed, plus vouching status for each item. |
| **Findings & exposure** | Findings register built from failed tests, with decision and explanation; exposure with and without the fines initiative. |
| **Response pack** | Document checklist, readiness, copy-ready tables. |
| **Methodology** | This research and the test catalogue inside the app. |

### Exposure model

- Output side: the higher of under-declared output VAT (register or ledger above the return) and unexplained revenue × rate, so the same error is not counted twice.
- Input side: VAT claimed in the return above defensible VAT (valid invoice, not blocked, valid supplier VAT number, not a duplicate).
- Penalties: incorrect-return penalty (50% of the difference), late payment (5% per month or part), late filing (5–25%, shown as a range).
- Scenario B (fines initiative): eligible penalties set to zero when corrections are filed and principal is paid before the initiative ends.

### Compliance score

100 × (weighted passed tests ÷ weighted applicable tests), with weights high = 3, medium = 2, low = 1. Tests with no data are excluded, not counted as passed.

## 4. Roadmap beyond the browser version

- Server edition (multi-user, roles, audit trail, encrypted storage) for teams and advisors.
- Direct ERP connectors and FATOORA invoice-data import for invoice-level matching.
- Customs (Bayan) and withholding-tax data import for automatic Box 8 / Box 9 matching.
- Machine-learning classification of VAT treatment from invoice descriptions (as in KPMG AVA), always with human validation.
