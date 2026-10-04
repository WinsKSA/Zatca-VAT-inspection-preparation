import datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as L
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.comments import Comment

import os; OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.environ.get("OUTNAME","ZATCA_VAT_Inspection_Pack.xlsx"))

F = "Arial"
GREEN_DARK = "1B5E4B"
f_base = Font(name=F, size=10)
f_bold = Font(name=F, size=10, bold=True)
f_hdr = Font(name=F, size=10, bold=True, color="FFFFFF")
f_title = Font(name=F, size=15, bold=True, color=GREEN_DARK)
f_sub = Font(name=F, size=10, italic=True, color="555555")
f_in = Font(name=F, size=10, color="0000FF")
f_link = Font(name=F, size=10, color="008000")
f_sec = Font(name=F, size=11, bold=True, color=GREEN_DARK)
fill_hdr = PatternFill("solid", fgColor=GREEN_DARK)
fill_in = PatternFill("solid", fgColor="FFFFCC")
fill_calc = PatternFill("solid", fgColor="F2F2F2")
fill_sec = PatternFill("solid", fgColor="E2EFDA")
fill_tot = PatternFill("solid", fgColor="D9E1F2")
fill_red = PatternFill("solid", fgColor="F8CBAD")
fill_ok = PatternFill("solid", fgColor="C6EFCE")
thin = Side(style="thin", color="BFBFBF")
box = Border(left=thin, right=thin, top=thin, bottom=thin)
wrap = Alignment(wrap_text=True, vertical="top")
center = Alignment(horizontal="center", vertical="center", wrap_text=True)
NUM = '#,##0.00;(#,##0.00);"-"'
INT = '#,##0;(#,##0);"-"'
DATE = 'dd-mmm-yyyy'
PCT = '0.0%'

wb = Workbook()

def sheet(name, tab=None):
    ws = wb.create_sheet(name)
    ws.sheet_view.showGridLines = False
    if tab: ws.sheet_properties.tabColor = tab
    return ws

def title(ws, text, sub):
    ws["A1"] = text; ws["A1"].font = f_title
    ws["A2"] = sub; ws["A2"].font = f_sub

def hdr(ws, row, col, labels, height=30):
    for i, t in enumerate(labels):
        c = ws.cell(row=row, column=col + i, value=t)
        c.font = f_hdr; c.fill = fill_hdr; c.alignment = center; c.border = box
    ws.row_dimensions[row].height = height

def put(ws, ref, val, font=f_base, fmt=None, fill=None, align=None, border=True):
    c = ws[ref]; c.value = val; c.font = font
    if fmt: c.number_format = fmt
    if fill: c.fill = fill
    if align: c.alignment = align
    if border: c.border = box
    return c

def widths(ws, d):
    for k, v in d.items(): ws.column_dimensions[k].width = v

def status_cf(ws, rng):
    first = rng.split(":")[0].replace("$", "")
    ws.conditional_formatting.add(rng, FormulaRule(formula=[f'LEFT({first},1)="✗"'], fill=fill_red, font=Font(name=F, bold=True, color="9C0006")))
    ws.conditional_formatting.add(rng, FormulaRule(formula=[f'LEFT({first},1)="✓"'], fill=fill_ok, font=Font(name=F, bold=True, color="006100")))

def dv_list(ws, src, rng):
    dv = DataValidation(type="list", formula1=src, allow_blank=True)
    dv.error = "Choose a value from the list"; dv.showErrorMessage = True
    ws.add_data_validation(dv); dv.add(rng)

# ---------------------------------------------------------------- Lists
SALES_CATS = ["Standard 15% (Box 1)", "Citizens - Healthcare/Education (Box 2)", "Zero-rated domestic (Box 3)",
              "Export (Box 4)", "Exempt (Box 5)", "Out of scope"]
PUR_CATS = ["Standard domestic 15% (Box 7)", "Import - VAT paid at customs (Box 8)", "Import - Reverse charge (Box 9)",
            "Zero-rated purchase (Box 10)", "Exempt purchase (Box 11)", "Out of scope / Not reported"]
TB_MAPS = SALES_CATS[:5] + ["Revenue - Out of scope / Other income", "Output VAT", "Input VAT",
                            "VAT Payable / Settlement", "Not VAT relevant"]
DOC_TYPES = ["Tax Invoice", "Simplified Tax Invoice", "Credit Note", "Debit Note"]
CUST_TYPES = ["B2B - VAT registered", "B2B - Not registered", "B2C - Individual", "Government"]
NATURE = ["General business expense", "Capital asset", "Entertainment / hospitality (blocked)",
          "Motor vehicle - private use (blocked)", "Staff personal benefit (blocked)", "Other non-business (blocked)"]
YESNO = ["Yes", "No"]
STATUS = ["Not started", "In progress", "Ready", "Submitted", "N/A"]
FS = ["Asset", "Liability", "Equity", "Revenue", "Expense"]
FREQ = ["Monthly", "Quarterly"]
LISTS = [("Sales VAT Category", SALES_CATS), ("Purchase VAT Category", PUR_CATS), ("TB VAT Mapping", TB_MAPS),
         ("Document Type", DOC_TYPES), ("Customer Type", CUST_TYPES), ("Expense Nature", NATURE),
         ("Yes/No", YESNO), ("Checklist Status", STATUS), ("FS Class", FS), ("Filing Frequency", FREQ)]
LREF = {}

# ---------------------------------------------------------------- sheets (order)
wb.remove(wb.active)
ws_dash = sheet("Dashboard", GREEN_DARK)
ws_set = sheet("Setup", "FFC000")
ws_chk = sheet("Checklist", "FFC000")
ws_tb = sheet("TB_Monthly", "4472C4")
ws_ret = sheet("VAT_Returns", "4472C4")
ws_s = sheet("Sales_Register", "4472C4")
ws_p = sheet("Purchase_Register", "4472C4")
ws_pay = sheet("ZATCA_Payments", "4472C4")
ws_rs = sheet("Recon_Sales", "70AD47")
ws_ro = sheet("Recon_OutputVAT", "70AD47")
ws_ri = sheet("Recon_InputVAT", "70AD47")
ws_rv = sheet("Recon_VAT_Account", "70AD47")
ws_g = sheet("Inspection_Guide", "7F7F7F")
ws_l = sheet("Lists", "7F7F7F")

for i, (name, vals) in enumerate(LISTS):
    col = L(i + 1)
    c = ws_l.cell(row=1, column=i + 1, value=name); c.font = f_hdr; c.fill = fill_hdr; c.alignment = center
    for j, v in enumerate(vals):
        ws_l.cell(row=j + 2, column=i + 1, value=v).font = f_base
    ws_l.column_dimensions[col].width = 40
    LREF[name] = f"=Lists!${col}$2:${col}${len(vals) + 1}"

# ---------------------------------------------------------------- Setup
ws = ws_set
title(ws, "Setup – Company & Audit Period", "Yellow cells with blue text are inputs. Everything else in the workbook is driven by these settings.")
rows = [
    ("Company Name (اسم المنشأة)", "Example Trading Company", None, "Your legal name as on the VAT certificate"),
    ("VAT Registration No (الرقم الضريبي)", "300000000000003", None, "15 digits, starts and ends with 3"),
    ("Commercial Registration No", "1010000000", None, ""),
    ("Fiscal Year Start (audit year)", dt.date(2025, 1, 1), DATE, "First day of the year under inspection"),
    ("Filing Frequency", "Monthly", None, "Monthly if taxable supplies > SAR 40M/yr, otherwise Quarterly"),
    ("Standard VAT Rate", 0.15, PCT, "15% since 1 July 2020"),
    ("Variance Tolerance (SAR)", 10, NUM, "Differences within this amount are treated as rounding"),
    ("As-of Date (for penalty estimates)", dt.date(2026, 10, 4), DATE, "Usually today's date or the inspection date"),
    ("Late Payment Penalty (per month or part)", 0.05, PCT, "VAT Law Art. 43 – verify current rule"),
    ("Incorrect Return Penalty (% of difference)", 0.50, PCT, "VAT Law Art. 42 – indicative, verify current rule"),
]
hdr(ws, 3, 1, ["Setting", "Value", "Check / Note"])
for i, (lab, val, fmt, note) in enumerate(rows):
    r = 4 + i
    put(ws, f"A{r}", lab, f_bold)
    put(ws, f"B{r}", val, f_in, fmt, fill_in)
    put(ws, f"C{r}", note, f_sub)
ws["B5"].number_format = "@"
put(ws, "C5", '=IF(AND(LEN(B5)=15,LEFT(B5,1)="3",RIGHT(B5,1)="3",ISNUMBER(--B5)),"✓ Valid format","✗ Invalid VAT number format")', f_bold)
put(ws, "A14", "Periods in Year (calc)", f_bold); put(ws, "B14", '=IF(B8="Monthly",12,4)', f_base, INT, fill_calc)
put(ws, "A15", "Months per Period (calc)", f_bold); put(ws, "B15", "=12/B14", f_base, INT, fill_calc)
dv_list(ws, LREF["Filing Frequency"], "B8")
status_cf(ws, "C5")

put(ws, "A17", "Tax Periods (auto-generated from the settings above)", f_sec, border=False)
hdr(ws, 18, 1, ["Period #", "Period Label", "Start Date", "End Date", "Return & Payment Due Date"])
for i in range(12):
    r = 19 + i
    put(ws, f"A{r}", i + 1, f_base, INT, align=center)
    put(ws, f"C{r}", f'=IF(A{r}>$B$14,"",EDATE($B$7,(A{r}-1)*$B$15))', f_base, DATE, fill_calc)
    put(ws, f"D{r}", f'=IF(C{r}="","",EDATE(C{r},$B$15)-1)', f_base, DATE, fill_calc)
    put(ws, f"B{r}", f'=IF(C{r}="","",IF($B$8="Monthly",TEXT(C{r},"mmm yyyy"),"Q"&A{r}&" "&TEXT(C{r},"yyyy")))', f_base, None, fill_calc)
    put(ws, f"E{r}", f'=IF(D{r}="","",EOMONTH(D{r},1))', f_base, DATE, fill_calc)
ws["E18"].comment = Comment("VAT returns and payment are due by the last day of the month following the end of the tax period.", "VAT Pack")
widths(ws, {"A": 42, "B": 26, "C": 48, "D": 16, "E": 22})
ws.freeze_panes = "A4"

PER_NO, PER_ST, PER_EN, PER_DUE = "Setup!$A$19:$A$30", "Setup!$C$19:$C$30", "Setup!$D$19:$D$30", "Setup!$E$19:$E$30"
TOL, RATE = "Setup!$B$10", "Setup!$B$9"

# ---------------------------------------------------------------- TB_Monthly
ws = ws_tb
TB1, TBN = 6, int(os.environ.get("TBROWS","505"))
title(ws, "Monthly Trial Balance (ميزان المراجعة الشهري)", "Paste your TB: opening balance + monthly NET movements. Debit = positive, Credit = negative. Map every account in column D.")
put(ws, "D3", "Balance check (must = 0) →", f_bold, border=False, align=Alignment(horizontal="right"))
put(ws, "E4", "Month-end →", f_sub, border=False, align=Alignment(horizontal="right"))
for m in range(12):
    col = L(6 + m)
    put(ws, f"{col}4", "=EOMONTH(Setup!$B$7,0)" if m == 0 else f"=EOMONTH({L(5 + m)}4,1)", f_link, "mmm-yy", fill_calc, center)
hdr(ws, 5, 1, ["Account Code", "Account Name", "FS Class", "VAT Mapping", "Opening Balance"] +
    [f"Movement M{m + 1}" for m in range(12)] + ["Total Movements", "Closing Balance"])
for c in range(5, 20):
    col = L(c)
    put(ws, f"{col}3", f"=ROUND(SUM({col}{TB1}:{col}{TBN}),2)", f_bold, NUM, fill_tot)
ws.conditional_formatting.add("E3:S3", FormulaRule(formula=["E3<>0"], fill=fill_red))
ws.conditional_formatting.add("E3:S3", FormulaRule(formula=["E3=0"], fill=fill_ok))
tb_example = [
    ("1100", "Cash at Bank", "Asset", "Not VAT relevant", 500000, {1: 81000, 2: -9000}),
    ("2210", "Output VAT", "Liability", "Output VAT", 0, {1: -16500}),
    ("2220", "Input VAT", "Asset", "Input VAT", 0, {1: 7500}),
    ("2230", "VAT Payable - Settlement with ZATCA", "Liability", "VAT Payable / Settlement", 0, {2: 9000}),
    ("3100", "Share Capital / Retained Earnings", "Equity", "Not VAT relevant", -500000, {}),
    ("4100", "Sales - Local", "Revenue", "Standard 15% (Box 1)", 0, {1: -100000}),
    ("4200", "Sales - Export", "Revenue", "Export (Box 4)", 0, {1: -20000}),
    ("4900", "Other Income - Dividends", "Revenue", "Revenue - Out of scope / Other income", 0, {1: -2000}),
    ("5100", "Cost of Goods Purchased", "Expense", "Not VAT relevant", 0, {1: 40000}),
    ("6100", "Consulting Fees - Foreign", "Expense", "Not VAT relevant", 0, {1: 10000}),
]
for r in range(TB1, TBN + 1):
    ex = tb_example[r - TB1] if r - TB1 < len(tb_example) else None
    for c in range(1, 18):
        cell = ws.cell(row=r, column=c); cell.font = f_in; cell.fill = fill_in; cell.border = box
        if c >= 5: cell.number_format = NUM
    if ex:
        code, name, fs, mp, ob, mv = ex
        ws.cell(row=r, column=1, value=code); ws.cell(row=r, column=2, value=name)
        ws.cell(row=r, column=3, value=fs); ws.cell(row=r, column=4, value=mp); ws.cell(row=r, column=5, value=ob)
        for m, v in mv.items(): ws.cell(row=r, column=5 + m, value=v)
    put(ws, f"R{r}", f'=IF(A{r}="","",SUM(F{r}:Q{r}))', f_base, NUM, fill_calc)
    put(ws, f"S{r}", f'=IF(A{r}="","",E{r}+R{r})', f_base, NUM, fill_calc)
dv_list(ws, LREF["FS Class"], f"C{TB1}:C{TBN}")
dv_list(ws, LREF["TB VAT Mapping"], f"D{TB1}:D{TBN}")
ws.conditional_formatting.add(f"D{TB1}:D{TBN}", FormulaRule(formula=[f'AND(A{TB1}<>"",D{TB1}="")'], fill=fill_red))
widths(ws, {"A": 12, "B": 34, "C": 11, "D": 34, "E": 15, "R": 16, "S": 16})
for m in range(12): ws.column_dimensions[L(6 + m)].width = 13
ws.freeze_panes = "C6"
ws.auto_filter.ref = f"A5:S{TBN}"

TBD = f"TB_Monthly!$D${TB1}:$D${TBN}"
TBM = f"TB_Monthly!$F${TB1}:$Q${TBN}"
TBH = "TB_Monthly!$F$4:$Q$4"
TBE = f"TB_Monthly!$E${TB1}:$E${TBN}"

def tb_period(mapexpr, st, en):
    return f"SUMPRODUCT(({mapexpr})*({TBH}>={st})*({TBH}<={en})*{TBM})"

# ---------------------------------------------------------------- VAT_Returns
ws = ws_ret
R1, RN, RT = 6, 17, 18
title(ws, "VAT Returns as Filed (إقرارات ضريبة القيمة المضافة)", "Copy each return EXACTLY as filed on the ZATCA portal. Adjustments (credit notes) as negative. Grey columns recalculate the return and check it.")
BOXES = [(1, "Standard rated sales 15%\nالمبيعات الخاضعة للنسبة الأساسية"),
         (2, "Sales to citizens (private health / education)\nالمبيعات للمواطنين"),
         (3, "Zero-rated domestic sales\nالمبيعات المحلية بنسبة صفر"),
         (4, "Exports\nالصادرات"),
         (5, "Exempt sales\nالمبيعات المعفاة"),
         (7, "Standard rated domestic purchases 15%\nالمشتريات المحلية الخاضعة للنسبة الأساسية"),
         (8, "Imports – VAT paid at customs\nالاستيرادات – ضريبة مدفوعة في الجمارك"),
         (9, "Imports – reverse charge (RCM)\nالاستيرادات – الاحتساب العكسي"),
         (10, "Zero-rated purchases\nالمشتريات بنسبة صفر"),
         (11, "Exempt purchases\nالمشتريات المعفاة")]
BC = {}  # box -> (amt col, adj col, vat col)
hdr(ws, 5, 1, ["Period #", "Period", "Due Date", "Date Filed", "Return Ref"], 20)
for c in range(1, 6):
    ws.merge_cells(start_row=4, start_column=c, end_row=5, end_column=c)
    ws.cell(row=4, column=c).value = ws.cell(row=5, column=c).value
    ws.cell(row=4, column=c).font = f_hdr; ws.cell(row=4, column=c).fill = fill_hdr; ws.cell(row=4, column=c).alignment = center
for k, (b, name) in enumerate(BOXES):
    c0 = 6 + 3 * k
    BC[b] = (L(c0), L(c0 + 1), L(c0 + 2))
    ws.merge_cells(start_row=4, start_column=c0, end_row=4, end_column=c0 + 2)
    cell = ws.cell(row=4, column=c0, value=f"Box {b} – {name}")
    cell.font = f_hdr; cell.fill = fill_hdr if b < 7 else PatternFill("solid", fgColor="2F5597"); cell.alignment = center
    hdr(ws, 5, c0, ["Amount", "Adjustment", "VAT"], 20)
ws.row_dimensions[4].height = 48
extra_in = ["Box 14 – Corrections from previous periods (±5,000)", "Box 15 – VAT credit carried forward", "Box 16 – Net VAT due AS FILED"]
calc = ["Box 6 – Total sales (net, recalc)", "Box 6 – Output VAT incl. RCM (recalc)", "Box 12 – Total purchases (net, recalc)",
        "Box 12 – Input VAT (recalc)", "Box 13 – Net VAT for period (recalc)", "Box 16 – Net VAT due (recalc)",
        "Arithmetic check (filed vs recalc)", "Filed on time?", "Box 14 within ±5,000?"]
c0 = 36
for i, t in enumerate(extra_in + calc):
    col = c0 + i
    ws.merge_cells(start_row=4, start_column=col, end_row=5, end_column=col)
    cell = ws.cell(row=4, column=col, value=t); cell.font = f_hdr; cell.alignment = center
    cell.fill = fill_hdr if i < 3 else PatternFill("solid", fgColor="595959")
# AJ AK AL inputs; AM..AU calcs
def net(b, r): a, d, _ = BC[b]; return f"{a}{r}+{d}{r}"
for i in range(12):
    r = R1 + i; sr = 19 + i
    put(ws, f"A{r}", f'=IF(Setup!C{sr}="","",Setup!A{sr})', f_link, INT, align=center)
    put(ws, f"B{r}", f"=Setup!B{sr}", f_link)
    put(ws, f"C{r}", f"=Setup!E{sr}", f_link, DATE)
    put(ws, f"D{r}", None, f_in, DATE, fill_in)
    put(ws, f"E{r}", None, f_in, None, fill_in)
    for b in BC:
        for col in BC[b]: put(ws, f"{col}{r}", None, f_in, NUM, fill_in)
    for col in ["AJ", "AK", "AL"]: put(ws, f"{col}{r}", None, f_in, NUM, fill_in)
    g = f'=IF($A{r}="","",'
    put(ws, f"AM{r}", g + "+".join(f"({net(b, r)})" for b in [1, 2, 3, 4, 5]) + ")", f_base, NUM, fill_calc)
    put(ws, f"AN{r}", g + "+".join(f"{BC[b][2]}{r}" for b in [1, 2, 3, 4, 5, 9]) + ")", f_base, NUM, fill_calc)
    put(ws, f"AO{r}", g + "+".join(f"({net(b, r)})" for b in [7, 8, 9, 10, 11]) + ")", f_base, NUM, fill_calc)
    put(ws, f"AP{r}", g + "+".join(f"{BC[b][2]}{r}" for b in [7, 8, 9, 10, 11]) + ")", f_base, NUM, fill_calc)
    put(ws, f"AQ{r}", g + f"AN{r}-AP{r})", f_base, NUM, fill_calc)
    put(ws, f"AR{r}", g + f"AQ{r}+AJ{r}-AK{r})", f_base, NUM, fill_calc)
    put(ws, f"AS{r}", g + f'IF(AND(D{r}="",AL{r}=""),"– Not entered",IF(ABS(AL{r}-AR{r})<={TOL},"✓ Agrees","✗ Filed ≠ recalc")))', f_base, None, fill_calc)
    put(ws, f"AT{r}", g + f'IF(D{r}="","– No filing date",IF(D{r}<=C{r},"✓ On time","✗ Late "&(D{r}-C{r})&" days")))', f_base, None, fill_calc)
    put(ws, f"AU{r}", g + f'IF(ABS(AJ{r})<=5000,"✓ OK","✗ >5,000 – needs voluntary disclosure"))', f_base, None, fill_calc)
put(ws, f"B{RT}", "TOTAL YEAR", f_bold, fill=fill_tot)
for c in range(6, 45):
    col = L(c)
    put(ws, f"{col}{RT}", f"=SUM({col}{R1}:{col}{RN})", f_bold, NUM, fill_tot)
for c in ["A", "C", "D", "E"]: ws[f"{c}{RT}"].fill = fill_tot
status_cf(ws, f"AS{R1}:AU{RN}")
ws["AN4"].comment = Comment("On the ZATCA return, VAT on reverse-charge imports (Box 9) is added to BOTH output VAT and input VAT, so it nets to zero for fully taxable businesses. Confirm against your filed return.", "VAT Pack")
widths(ws, {"A": 8, "B": 12, "C": 12, "D": 12, "E": 14})
for c in range(6, 36): ws.column_dimensions[L(c)].width = 13
for c in range(36, 48): ws.column_dimensions[L(c)].width = 17
ws.freeze_panes = "F6"
put(ws, "A20", "Example: January 2025 is filled in to show the format – overwrite with your real filed figures.", f_sub, border=False)
jan = {BC[1][0]: 100000, BC[1][2]: 15000, BC[4][0]: 20000, BC[7][0]: 40000, BC[7][2]: 6000,
       BC[9][0]: 10000, BC[9][2]: 1500, "AJ": 0, "AK": 0, "AL": 9000}
ws["D6"] = dt.date(2025, 2, 25); ws["E6"] = "VAT-2025-01"
for col, v in jan.items(): ws[f"{col}6"] = v

# ---------------------------------------------------------------- Sales_Register
ws = ws_s
S1, SN = 6, int(os.environ.get("ROWS","5005"))
title(ws, "Sales Register – invoice level (سجل المبيعات)", "Export from ERP / FATOORA. Credit notes as NEGATIVE amounts. Grey columns calculate expected VAT and flag issues ZATCA will look for.")
hdr(ws, 5, 1, ["Invoice Date", "Invoice No", "Document Type", "Customer Name", "Customer VAT No", "Customer Type",
               "VAT Category", "Net Amount (SAR)", "VAT Amount (SAR)", "Total (SAR)", "E-Invoice UUID / Ref",
               "Reported/Cleared on FATOORA?", "GL Revenue Account", "Evidence Ref (export / zero-rate)",
               "Period #", "Expected VAT", "VAT Difference", "Exceptions / Flags"], 40)
ex_s = [
    (dt.date(2025, 1, 15), "INV-0001", "Tax Invoice", "ABC Trading Co", "310123456700003", "B2B - VAT registered",
     "Standard 15% (Box 1)", 100000, 15000, "e3b0c442-98fc-1c14", "Yes", "4100", ""),
    (dt.date(2025, 1, 20), "INV-0002", "Tax Invoice", "Gulf Imports LLC (UAE)", "", "B2B - Not registered",
     "Export (Box 4)", 20000, 0, "a1f2c3d4-55aa-77bb", "Yes", "4200", "Customs exit decl. 123456 + B/L GLF-889"),
]
vatok = lambda x: f'AND(LEN({x})=15,LEFT({x},1)="3",RIGHT({x},1)="3",ISNUMBER(--{x}))'
for r in range(S1, SN + 1):
    for c in range(1, 15):
        cell = ws.cell(row=r, column=c); cell.font = f_in; cell.fill = fill_in; cell.border = box
    ws[f"A{r}"].number_format = DATE; ws[f"E{r}"].number_format = "@"
    for c in "HI": ws[f"{c}{r}"].number_format = NUM
    i = r - S1
    if i < len(ex_s):
        vals = ex_s[i]
        for c, v in zip("ABCDEFGHIKLMN", vals): ws[f"{c}{r}"] = v
    g = f'=IF(A{r}="","",'
    put(ws, f"J{r}", g + f"H{r}+I{r})", f_base, NUM, fill_calc)
    put(ws, f"O{r}", g + f"SUMPRODUCT((A{r}>={PER_ST})*(A{r}<={PER_EN})*{PER_NO}))", f_base, INT, fill_calc)
    put(ws, f"P{r}", g + f'IF(G{r}="{SALES_CATS[0]}",ROUND(H{r}*{RATE},2),0))', f_base, NUM, fill_calc)
    put(ws, f"Q{r}", g + f"I{r}-P{r})", f_base, NUM, fill_calc)
    flags = (f'IF(O{r}=0,"Outside audit periods; ","")'
             f'&IF(G{r}="","No VAT category; ","")'
             f'&IF(ABS(Q{r})>{TOL},"VAT ≠ 15% × net; ","")'
             f'&IF(AND(F{r}="B2B - VAT registered",NOT({vatok(f"E{r}")})),"Invalid/missing customer VAT no; ","")'
             f'&IF(L{r}<>"Yes","Not reported/cleared on FATOORA; ","")'
             f'&IF(AND(OR(G{r}="{SALES_CATS[2]}",G{r}="{SALES_CATS[3]}"),N{r}=""),"Zero-rate/export evidence missing; ","")'
             f'&IF(AND(C{r}="Credit Note",H{r}>0),"Credit note should be negative; ","")'
             f'&IF(AND(C{r}="Simplified Tax Invoice",F{r}="B2B - VAT registered"),"Simplified invoice issued to VAT-registered B2B; ","")')
    put(ws, f"R{r}", g + flags + ")", f_base, None, fill_calc)
dv_list(ws, LREF["Document Type"], f"C{S1}:C{SN}")
dv_list(ws, LREF["Customer Type"], f"F{S1}:F{SN}")
dv_list(ws, LREF["Sales VAT Category"], f"G{S1}:G{SN}")
dv_list(ws, LREF["Yes/No"], f"L{S1}:L{SN}")
ws.conditional_formatting.add(f"R{S1}:R{SN}", FormulaRule(formula=[f"LEN(R{S1})>0"], fill=fill_red))
put(ws, "A3", "Rows flagged:", f_bold, border=False)
put(ws, "B3", f'=SUMPRODUCT((A{S1}:A{SN}<>"")*(LEN(R{S1}:R{SN})>0))', f_bold, INT, fill_tot)
put(ws, "C3", "Rows with data:", f_bold, border=False)
put(ws, "D3", f"=COUNT(A{S1}:A{SN})", f_bold, INT, fill_tot)
widths(ws, {"A": 12, "B": 13, "C": 18, "D": 26, "E": 17, "F": 20, "G": 30, "H": 15, "I": 14, "J": 15, "K": 22,
            "L": 13, "M": 12, "N": 30, "O": 8, "P": 14, "Q": 13, "R": 60})
ws.freeze_panes = "C6"; ws.auto_filter.ref = f"A5:R{SN}"

SR = lambda c: f"Sales_Register!${c}${S1}:${c}${SN}"

# ---------------------------------------------------------------- Purchase_Register
ws = ws_p
P1, PN = 6, int(os.environ.get("ROWS","5005"))
title(ws, "Purchase Register – invoice level (سجل المشتريات)", "Every invoice / customs declaration on which input VAT exists. Grey columns test whether the input VAT is defensible in an inspection.")
hdr(ws, 5, 1, ["Invoice Date", "Supplier Invoice No", "Supplier Name", "Supplier VAT No", "Supplier Country",
               "VAT Category", "Expense Nature", "Net Amount (SAR)", "VAT Amount (SAR)", "Total (SAR)",
               "Valid Tax Invoice / Customs Decl. Held?", "Input VAT Claimed in Return?", "Customs Declaration No (Bayan)",
               "GL Account", "Period #", "Expected VAT", "VAT Difference", "VAT Claimed", "Defensible VAT",
               "VAT at Risk", "Exceptions / Flags"], 40)
ex_p = [
    (dt.date(2025, 1, 10), "SUP-778", "Al Noor Supplies", "310123456700003", "Saudi Arabia", PUR_CATS[0], NATURE[0],
     40000, 6000, "Yes", "Yes", "", "5100"),
    (dt.date(2025, 1, 25), "FX-2025-01", "Global Consulting Ltd", "", "United Kingdom", PUR_CATS[2], NATURE[0],
     10000, 1500, "Yes", "Yes", "", "6100"),
]
for r in range(P1, PN + 1):
    for c in range(1, 15):
        cell = ws.cell(row=r, column=c); cell.font = f_in; cell.fill = fill_in; cell.border = box
    ws[f"A{r}"].number_format = DATE; ws[f"D{r}"].number_format = "@"
    for c in "HI": ws[f"{c}{r}"].number_format = NUM
    i = r - P1
    if i < len(ex_p):
        for c, v in zip("ABCDEFGHIKLMN", ex_p[i]): ws[f"{c}{r}"] = v
    g = f'=IF(A{r}="","",'
    blocked = f'ISNUMBER(SEARCH("blocked",G{r}))'
    vatable = f'OR(F{r}="{PUR_CATS[0]}",F{r}="{PUR_CATS[1]}",F{r}="{PUR_CATS[2]}")'
    put(ws, f"J{r}", g + f"H{r}+I{r})", f_base, NUM, fill_calc)
    put(ws, f"O{r}", g + f"SUMPRODUCT((A{r}>={PER_ST})*(A{r}<={PER_EN})*{PER_NO}))", f_base, INT, fill_calc)
    put(ws, f"P{r}", g + f"IF({vatable},ROUND(H{r}*{RATE},2),0))", f_base, NUM, fill_calc)
    put(ws, f"Q{r}", g + f"I{r}-P{r})", f_base, NUM, fill_calc)
    put(ws, f"R{r}", g + f'IF(L{r}="Yes",I{r},0))', f_base, NUM, fill_calc)
    put(ws, f"S{r}", g + f'IF(AND(L{r}="Yes",K{r}="Yes",NOT({blocked}),{vatable},OR(F{r}<>"{PUR_CATS[0]}",{vatok(f"D{r}")})),I{r},0))', f_base, NUM, fill_calc)
    put(ws, f"T{r}", g + f"R{r}-S{r})", f_base, NUM, fill_calc)
    flags = (f'IF(O{r}=0,"Outside audit periods; ","")'
             f'&IF(F{r}="","No VAT category; ","")'
             f'&IF(ABS(Q{r})>{TOL},"VAT ≠ 15% × net; ","")'
             f'&IF(AND(F{r}="{PUR_CATS[0]}",NOT({vatok(f"D{r}")})),"Invalid/missing supplier VAT no; ","")'
             f'&IF(AND(L{r}="Yes",K{r}<>"Yes"),"VAT claimed without valid tax invoice; ","")'
             f'&IF(AND(L{r}="Yes",{blocked}),"Blocked input VAT claimed; ","")'
             f'&IF(AND(F{r}="{PUR_CATS[1]}",M{r}=""),"Customs declaration no missing; ","")'
             f'&IF(AND(F{r}="{PUR_CATS[2]}",E{r}="Saudi Arabia"),"RCM used for a local supplier; ","")'
             f'&IF(AND(L{r}="Yes",NOT({vatable})),"VAT claimed on non-taxable category; ","")')
    put(ws, f"U{r}", g + flags + ")", f_base, None, fill_calc)
dv_list(ws, LREF["Purchase VAT Category"], f"F{P1}:F{PN}")
dv_list(ws, LREF["Expense Nature"], f"G{P1}:G{PN}")
dv_list(ws, LREF["Yes/No"], f"K{P1}:L{PN}")
ws.conditional_formatting.add(f"U{P1}:U{PN}", FormulaRule(formula=[f"LEN(U{P1})>0"], fill=fill_red))
ws.conditional_formatting.add(f"T{P1}:T{PN}", FormulaRule(formula=[f"AND(ISNUMBER(T{P1}),T{P1}>0)"], fill=fill_red))
put(ws, "A3", "Rows flagged:", f_bold, border=False)
put(ws, "B3", f'=SUMPRODUCT((A{P1}:A{PN}<>"")*(LEN(U{P1}:U{PN})>0))', f_bold, INT, fill_tot)
put(ws, "C3", "VAT at risk (SAR):", f_bold, border=False)
put(ws, "D3", f"=SUM(T{P1}:T{PN})", f_bold, NUM, fill_tot)
widths(ws, {"A": 12, "B": 14, "C": 24, "D": 17, "E": 15, "F": 30, "G": 30, "H": 15, "I": 14, "J": 15, "K": 16,
            "L": 14, "M": 18, "N": 11, "O": 8, "P": 13, "Q": 12, "R": 13, "S": 13, "T": 12, "U": 60})
ws.freeze_panes = "C6"; ws.auto_filter.ref = f"A5:U{PN}"

PR = lambda c: f"Purchase_Register!${c}${P1}:${c}${PN}"

# ---------------------------------------------------------------- ZATCA_Payments
ws = ws_pay
Y1, YN = 6, int(os.environ.get("TBROWS","505"))
title(ws, "Payments to / Refunds from ZATCA (المدفوعات)", "One row per SADAD payment. Refunds received as NEGATIVE. Use Period # 0 for payments of periods before the audit year.")
hdr(ws, 5, 1, ["Period #", "Payment Date", "SADAD / Payment Ref", "Amount (SAR)", "Notes", "Period", "Due Date",
               "Days Late", "Months Late (or part)", "Est. Late Payment Penalty"], 36)
for r in range(Y1, YN + 1):
    for c in range(1, 6):
        cell = ws.cell(row=r, column=c); cell.font = f_in; cell.fill = fill_in; cell.border = box
    ws[f"B{r}"].number_format = DATE; ws[f"D{r}"].number_format = NUM; ws[f"A{r}"].number_format = INT
    g = f'=IF(OR(A{r}="",B{r}=""),"",'
    put(ws, f"F{r}", g + f'IFERROR(INDEX(Setup!$B$19:$B$30,A{r}),"Prior period"))', f_link, None, fill_calc)
    put(ws, f"G{r}", g + f'IFERROR(INDEX({PER_DUE},A{r})+0,""))', f_link, DATE, fill_calc)
    put(ws, f"H{r}", f'=IF(OR(G{r}="",B{r}=""),"",MAX(0,B{r}-G{r}))', f_base, INT, fill_calc)
    put(ws, f"I{r}", f'=IF(H{r}="","",IF(H{r}=0,0,(YEAR(B{r})-YEAR(G{r}))*12+MONTH(B{r})-MONTH(G{r})+IF(DAY(B{r})>DAY(G{r}),1,0)))', f_base, INT, fill_calc)
    put(ws, f"J{r}", f'=IF(I{r}="","",IF(D{r}>0,D{r}*Setup!$B$12*I{r},0))', f_base, NUM, fill_calc)
ws["A6"] = 1; ws["B6"] = dt.date(2025, 2, 27); ws["C6"] = "SADAD-90012345"; ws["D6"] = 9000; ws["E6"] = "Jan 2025 VAT"
widths(ws, {"A": 9, "B": 13, "C": 22, "D": 15, "E": 30, "F": 14, "G": 13, "H": 10, "I": 13, "J": 16})
ws.freeze_panes = "A6"
dv = DataValidation(type="whole", operator="between", formula1="0", formula2="12", allow_blank=True)
ws.add_data_validation(dv); dv.add(f"A{Y1}:A{YN}")

YR = lambda c: f"ZATCA_Payments!${c}${Y1}:${c}${YN}"

# ---------------------------------------------------------------- helpers for recon sheets
def period_cols(ws, r, i):
    sr = 19 + i
    put(ws, f"A{r}", f'=IF(Setup!C{sr}="","",Setup!A{sr})', f_link, INT, align=center)
    put(ws, f"B{r}", f"=Setup!B{sr}", f_link)

def stat(r, cols, zero_cols):
    allzero = "AND(" + ",".join(f"{c}{r}=0" for c in zero_cols) + ")"
    ok = "AND(" + ",".join(f"ABS({c}{r})<={TOL}" for c in cols) + ")"
    return f'=IF($A{r}="","",IF({allzero},"– No activity",IF({ok},"✓ Matched","✗ Investigate")))'

# ---------------------------------------------------------------- Recon_Sales
ws = ws_rs
title(ws, "Sales Reconciliation – Returns vs Register vs Trial Balance", "For each VAT box: what you DECLARED vs what you INVOICED vs what you BOOKED. ZATCA starts its audit here.")
r = 4
SALES_BOX = [(1, SALES_CATS[0]), (2, SALES_CATS[1]), (3, SALES_CATS[2]), (4, SALES_CATS[3]), (5, SALES_CATS[4])]
status_ranges = []
for b, cat in SALES_BOX:
    put(ws, f"A{r}", f"Box {b} – {cat}", f_sec, fill=fill_sec, border=False)
    for c in "BCDEFGH": ws[f"{c}{r}"].fill = fill_sec
    r += 1
    hdr(ws, r, 1, ["Period #", "Period", "Per VAT Return (net)", "Per Sales Register", "Per Trial Balance",
                   "Return − Register", "Return − TB", "Status"])
    r += 1; first = r
    for i in range(12):
        sr = 19 + i
        period_cols(ws, r, i)
        g = f'=IF($A{r}="","",'
        put(ws, f"C{r}", g + f"VAT_Returns!{BC[b][0]}{R1 + i}+VAT_Returns!{BC[b][1]}{R1 + i})", f_link, NUM)
        put(ws, f"D{r}", g + f'SUMIFS({SR("H")},{SR("O")},$A{r},{SR("G")},"{cat}"))', f_link, NUM)
        put(ws, f"E{r}", g + "-" + tb_period(f'{TBD}="{cat}"', f"Setup!$C${sr}", f"Setup!$D${sr}") + ")", f_link, NUM)
        put(ws, f"F{r}", g + f"C{r}-D{r})", f_base, NUM)
        put(ws, f"G{r}", g + f"C{r}-E{r})", f_base, NUM)
        put(ws, f"H{r}", stat(r, "FG", "CDE"), f_base)
        r += 1
    put(ws, f"B{r}", "TOTAL", f_bold, fill=fill_tot); ws[f"A{r}"].fill = fill_tot
    for c in "CDEFG": put(ws, f"{c}{r}", f"=SUM({c}{first}:{c}{r - 1})", f_bold, NUM, fill_tot)
    put(ws, f"H{r}", f'=IF(AND(ABS(F{r})<={TOL},ABS(G{r})<={TOL}),"✓ Matched","✗ Investigate")', f_bold, fill=fill_tot)
    status_cf(ws, f"H{first}:H{r}")
    status_ranges.append(f"Recon_Sales!H{first}:H{r - 1}")
    if b == 1: SALES_TOT_ROW_B1 = r
    r += 2

# annual revenue reconciliation
put(ws, f"A{r}", "Annual Revenue Reconciliation – Financial Statements vs VAT Returns (مطابقة الإيرادات)", f_sec, fill=fill_sec, border=False)
for c in "BCDEFGH": ws[f"{c}{r}"].fill = fill_sec
r += 1
REV0 = r
lines = [
    ("Total revenue per Trial Balance (all accounts with FS Class = Revenue)", f'=-SUMIF(TB_Monthly!$C${TB1}:$C${TBN},"Revenue",TB_Monthly!$R${TB1}:$R${TBN})'),
    ("Less: revenue mapped as Out of scope / Other income", f'=-SUMIF({TBD},"{TB_MAPS[5]}",TB_Monthly!$R${TB1}:$R${TBN})'),
    ("Revenue subject to VAT reporting per TB", f"=E{r}-E{r + 1}"),
    ("Total sales per VAT returns (Box 6, full year)", f"=VAT_Returns!AM{RT}"),
    ("Difference before reconciling items", f"=E{r + 2}-E{r + 3}"),
]
for lab, fml in lines:
    put(ws, f"A{r}", lab, f_bold if "Difference" in lab or "subject" in lab else f_base)
    ws.merge_cells(f"A{r}:D{r}")
    put(ws, f"E{r}", fml, f_link if "!" in fml else f_bold, NUM, fill_calc)
    r += 1
DIFF_ROW = r - 1
put(ws, f"A{r}", "Explained reconciling items (enter, with + / − sign that reduces the difference):", f_sub, border=False); r += 1
RI0 = r
items = ["e.g. Timing – December invoices booked in January", "e.g. Revenue accruals not yet invoiced", "e.g. Advance payments invoiced (VAT due on receipt)",
         "e.g. Deemed supplies declared but not in revenue", "Other (describe)"]
for t in items:
    put(ws, f"A{r}", t, f_in, fill=fill_in); ws.merge_cells(f"A{r}:D{r}")
    put(ws, f"E{r}", 0, f_in, NUM, fill_in); r += 1
put(ws, f"A{r}", "UNEXPLAINED DIFFERENCE", f_bold, fill=fill_tot); ws.merge_cells(f"A{r}:D{r}")
put(ws, f"E{r}", f"=E{DIFF_ROW}-SUM(E{RI0}:E{r - 1})", f_bold, NUM, fill_tot)
put(ws, f"F{r}", f'=IF(ABS(E{r})<={TOL},"✓ Fully reconciled","✗ Unexplained – ZATCA will treat as undeclared sales")', f_bold)
status_cf(ws, f"F{r}")
REV_UNEXPL = f"Recon_Sales!E{r}"; REV_TB = f"Recon_Sales!E{REV0 + 2}"; REV_RET = f"Recon_Sales!E{REV0 + 3}"
widths(ws, {"A": 9, "B": 52, "C": 18, "D": 18, "E": 18, "F": 16, "G": 16, "H": 16})
ws.freeze_panes = "A4"

# ---------------------------------------------------------------- Recon_OutputVAT
ws = ws_ro
title(ws, "Output VAT Reconciliation (مطابقة ضريبة المخرجات)", "Output VAT declared vs invoiced vs booked in GL vs 15% recomputation. Positive 'Potential under-declaration' = likely assessment.")
hdr(ws, 4, 1, ["Period #", "Period", "Per Return (Box 6 VAT incl. RCM)", "Register – Sales VAT", "Register – RCM VAT",
               "Register Total", "Recomputed 15% × (Box 1 + Box 9)", "Per GL (Output VAT accounts)",
               "Return − Register", "Return − Recomputed", "Return − GL", "Status", "Potential Under-declaration"], 45)
O1 = 5
for i in range(12):
    r = O1 + i; sr = 19 + i; rr = R1 + i
    period_cols(ws, r, i)
    g = f'=IF($A{r}="","",'
    put(ws, f"C{r}", g + f"VAT_Returns!AN{rr})", f_link, NUM)
    put(ws, f"D{r}", g + f'SUMIFS({SR("I")},{SR("O")},$A{r}))', f_link, NUM)
    put(ws, f"E{r}", g + f'SUMIFS({PR("I")},{PR("O")},$A{r},{PR("F")},"{PUR_CATS[2]}"))', f_link, NUM)
    put(ws, f"F{r}", g + f"D{r}+E{r})", f_base, NUM)
    put(ws, f"G{r}", g + f"ROUND((VAT_Returns!{BC[1][0]}{rr}+VAT_Returns!{BC[1][1]}{rr}+VAT_Returns!{BC[9][0]}{rr}+VAT_Returns!{BC[9][1]}{rr})*{RATE},2))", f_link, NUM)
    put(ws, f"H{r}", g + "-" + tb_period(f'{TBD}="Output VAT"', f"Setup!$C${sr}", f"Setup!$D${sr}") + ")", f_link, NUM)
    put(ws, f"I{r}", g + f"C{r}-F{r})", f_base, NUM)
    put(ws, f"J{r}", g + f"C{r}-G{r})", f_base, NUM)
    put(ws, f"K{r}", g + f"C{r}-H{r})", f_base, NUM)
    put(ws, f"L{r}", stat(r, "IJK", "CFH"), f_base)
    put(ws, f"M{r}", g + f"MAX(0,F{r}-C{r},H{r}-C{r}))", f_bold, NUM)
OT = O1 + 12
put(ws, f"B{OT}", "TOTAL", f_bold, fill=fill_tot); ws[f"A{OT}"].fill = fill_tot
for c in "CDEFGHIJKM": put(ws, f"{c}{OT}", f"=SUM({c}{O1}:{c}{OT - 1})", f_bold, NUM, fill_tot)
put(ws, f"L{OT}", f'=IF(COUNTIF(L{O1}:L{OT - 1},"✗*")=0,"✓ Matched","✗ Investigate")', f_bold, fill=fill_tot)
status_cf(ws, f"L{O1}:L{OT}")
ws.conditional_formatting.add(f"M{O1}:M{OT}", FormulaRule(formula=[f"AND(ISNUMBER(M{O1}),M{O1}>0)"], fill=fill_red))
status_ranges.append(f"Recon_OutputVAT!L{O1}:L{OT - 1}")
put(ws, f"A{OT + 2}", "Note: Box 2 (citizens' private healthcare/education) VAT is borne by the State and is excluded from the 15% recomputation. "
    "GL Output VAT should include RCM output VAT; if you book RCM in a separate account, map it to 'Output VAT' too.", f_sub, border=False)
widths(ws, {"A": 9, "B": 12, **{L(c): 16 for c in range(3, 14)}})
ws.freeze_panes = "C5"

# ---------------------------------------------------------------- Recon_InputVAT
ws = ws_ri
title(ws, "Input VAT Reconciliation (مطابقة ضريبة المدخلات)", "Input VAT claimed vs register vs GL, plus the portion ZATCA is likely to disallow (no valid invoice, blocked, invalid supplier VAT no).")
hdr(ws, 4, 1, ["Period #", "Period", "Per Return (Box 12 VAT)", "Register – VAT Claimed", "Register – Defensible VAT",
               "Register – VAT at Risk", "Per GL (Input VAT accounts)", "Return − Register Claimed", "Return − GL",
               "Status", "Potential Over-claim (Return − Defensible)",
               "Box 8 VAT per Return", "Customs VAT per Register", "Box 8 Difference",
               "Box 9 VAT per Return", "RCM VAT per Register", "Box 9 Difference"], 45)
I1 = 5
for i in range(12):
    r = I1 + i; sr = 19 + i; rr = R1 + i
    period_cols(ws, r, i)
    g = f'=IF($A{r}="","",'
    put(ws, f"C{r}", g + f"VAT_Returns!AP{rr})", f_link, NUM)
    put(ws, f"D{r}", g + f'SUMIFS({PR("R")},{PR("O")},$A{r}))', f_link, NUM)
    put(ws, f"E{r}", g + f'SUMIFS({PR("S")},{PR("O")},$A{r}))', f_link, NUM)
    put(ws, f"F{r}", g + f'SUMIFS({PR("T")},{PR("O")},$A{r}))', f_link, NUM)
    put(ws, f"G{r}", g + tb_period(f'{TBD}="Input VAT"', f"Setup!$C${sr}", f"Setup!$D${sr}") + ")", f_link, NUM)
    put(ws, f"H{r}", g + f"C{r}-D{r})", f_base, NUM)
    put(ws, f"I{r}", g + f"C{r}-G{r})", f_base, NUM)
    put(ws, f"J{r}", stat(r, "HI", "CDG"), f_base)
    put(ws, f"K{r}", g + f"MAX(0,C{r}-E{r}))", f_bold, NUM)
    put(ws, f"L{r}", g + f"VAT_Returns!{BC[8][2]}{rr})", f_link, NUM)
    put(ws, f"M{r}", g + f'SUMIFS({PR("I")},{PR("O")},$A{r},{PR("F")},"{PUR_CATS[1]}"))', f_link, NUM)
    put(ws, f"N{r}", g + f"L{r}-M{r})", f_base, NUM)
    put(ws, f"O{r}", g + f"VAT_Returns!{BC[9][2]}{rr})", f_link, NUM)
    put(ws, f"P{r}", g + f'SUMIFS({PR("I")},{PR("O")},$A{r},{PR("F")},"{PUR_CATS[2]}"))', f_link, NUM)
    put(ws, f"Q{r}", g + f"O{r}-P{r})", f_base, NUM)
IT = I1 + 12
put(ws, f"B{IT}", "TOTAL", f_bold, fill=fill_tot); ws[f"A{IT}"].fill = fill_tot
for c in "CDEFGHIKLMNOPQ": put(ws, f"{c}{IT}", f"=SUM({c}{I1}:{c}{IT - 1})", f_bold, NUM, fill_tot)
put(ws, f"J{IT}", f'=IF(COUNTIF(J{I1}:J{IT - 1},"✗*")=0,"✓ Matched","✗ Investigate")', f_bold, fill=fill_tot)
status_cf(ws, f"J{I1}:J{IT}")
for c in "KF":
    ws.conditional_formatting.add(f"{c}{I1}:{c}{IT}", FormulaRule(formula=[f"AND(ISNUMBER({c}{I1}),{c}{I1}>0)"], fill=fill_red))
for c in "NQ":
    ws.conditional_formatting.add(f"{c}{I1}:{c}{IT}", FormulaRule(formula=[f"AND(ISNUMBER({c}{I1}),ABS({c}{I1})>{TOL})"], fill=fill_red))
status_ranges.append(f"Recon_InputVAT!J{I1}:J{IT - 1}")
put(ws, f"A{IT + 2}", "Box 8 should also be matched to ZATCA's customs import data (request the importer statement from ZATCA/customs). "
    "Customs VAT is only deductible when the company is the importer of record on the Bayan.", f_sub, border=False)
widths(ws, {"A": 9, "B": 12, **{L(c): 16 for c in range(3, 18)}})
ws.freeze_panes = "C5"

# ---------------------------------------------------------------- Recon_VAT_Account
ws = ws_rv
title(ws, "VAT Control Account & Payments (مطابقة حساب الضريبة والسداد)", "Proves the GL VAT liability = returns filed − payments made. Also estimates late filing / payment exposure.")
VMAP = f'(({TBD}="Output VAT")+({TBD}="Input VAT")+({TBD}="VAT Payable / Settlement"))'
put(ws, "A3", "Opening GL VAT liability (credit = positive):", f_bold, border=False)
ws.merge_cells("A3:D3")
put(ws, "E3", f"=-SUMPRODUCT({VMAP}*{TBE})", f_link, NUM, fill_calc)
hdr(ws, 5, 1, ["Period #", "Period", "Period End", "Net VAT (Box 13 + Box 14)", "Box 16 as Filed", "Paid / (Refunded) for Period",
               "Outstanding for Period", "Due Date", "Penalty on Late Payments Made", "Penalty on Amount Still Unpaid (to As-of date)",
               "Filed on time?", "GL VAT Liability at Period End", "Expected Liability (Opening + Returns − Payments)",
               "Difference GL − Expected", "Status"], 50)
V1 = 6
for i in range(12):
    r = V1 + i; sr = 19 + i; rr = R1 + i
    period_cols(ws, r, i)
    g = f'=IF($A{r}="","",'
    put(ws, f"C{r}", f"=Setup!D{sr}", f_link, DATE)
    put(ws, f"D{r}", g + f"VAT_Returns!AQ{rr}+VAT_Returns!AJ{rr})", f_link, NUM)
    put(ws, f"E{r}", g + f"N(VAT_Returns!AL{rr}))", f_link, NUM)
    put(ws, f"F{r}", g + f'SUMIFS({YR("D")},{YR("A")},$A{r}))', f_link, NUM)
    put(ws, f"G{r}", g + f"MAX(E{r},0)-F{r})", f_base, NUM)
    put(ws, f"H{r}", f"=Setup!E{sr}", f_link, DATE)
    put(ws, f"I{r}", g + f'SUMIFS({YR("J")},{YR("A")},$A{r}))', f_link, NUM)
    asof = "Setup!$B$11"
    months = f"((YEAR({asof})-YEAR(H{r}))*12+MONTH({asof})-MONTH(H{r})+IF(DAY({asof})>DAY(H{r}),1,0))"
    put(ws, f"J{r}", g + f"IF(AND(G{r}>{TOL},{asof}>H{r}),G{r}*Setup!$B$12*{months},0))", f_base, NUM)
    put(ws, f"K{r}", f"=IF($A{r}=\"\",\"\",VAT_Returns!AT{rr})", f_link)
    put(ws, f"L{r}", g + f"-(SUMPRODUCT({VMAP}*{TBE})+SUMPRODUCT({VMAP}*({TBH}<=C{r})*{TBM})))", f_link, NUM)
    put(ws, f"M{r}", g + f'$E$3+SUM(D${V1}:D{r})-SUMIFS({YR("D")},{YR("B")},"<="&C{r}))', f_base, NUM)
    put(ws, f"N{r}", g + f"L{r}-M{r})", f_base, NUM)
    put(ws, f"O{r}", f'=IF($A{r}="","",IF(ABS(N{r})<={TOL},"✓ Agrees","✗ Investigate"))', f_base)
VT = V1 + 12
put(ws, f"B{VT}", "TOTAL", f_bold, fill=fill_tot)
for c in "ACH": ws[f"{c}{VT}"].fill = fill_tot
for c in "DEFGIJ": put(ws, f"{c}{VT}", f"=SUM({c}{V1}:{c}{VT - 1})", f_bold, NUM, fill_tot)
put(ws, f"O{VT}", f'=IF(COUNTIF(O{V1}:O{VT - 1},"✗*")=0,"✓ Agrees","✗ Investigate")', f_bold, fill=fill_tot)
status_cf(ws, f"K{V1}:K{VT - 1}"); status_cf(ws, f"O{V1}:O{VT}")
status_ranges.append(f"Recon_VAT_Account!O{V1}:O{VT - 1}")
put(ws, f"A{VT + 2}", "Penalties shown are indicative estimates only (5% of unpaid tax per month or part). ZATCA may also apply late-filing (5%–25%) and "
    "incorrect-return (50% of the difference) penalties – see Dashboard and Inspection_Guide.", f_sub, border=False)
widths(ws, {"A": 9, "B": 12, "C": 12, **{L(c): 16 for c in range(4, 16)}})
ws.freeze_panes = "C6"

# ---------------------------------------------------------------- Checklist
ws = ws_chk
title(ws, "Document Request Checklist (قائمة المستندات المطلوبة)", "Typical documents ZATCA requests in a VAT inspection. Track status, owner and file reference for each.")
hdr(ws, 4, 1, ["#", "Area", "Document / Analysis Requested", "Prepared in this workbook?", "Owner", "Due Date", "Status", "File Ref / Location", "Notes"], 32)
CHK = [
    ("General", "VAT registration certificate, Commercial Registration, Articles of Association", ""),
    ("General", "Description of business activities and revenue streams + VAT treatment memo for each", ""),
    ("General", "List of branches, related parties and VAT group members (if any)", ""),
    ("General", "Chart of accounts with VAT mapping", "TB_Monthly col D"),
    ("General", "ERP / accounting system description and e-invoicing (FATOORA) solution details, onboarding & CSID", ""),
    ("General", "Authorisation letter for the representative dealing with ZATCA", ""),
    ("Financial", "Audited financial statements for each year under review", ""),
    ("Financial", "Monthly trial balances (opening, movements, closing)", "TB_Monthly"),
    ("Financial", "General ledger detail: revenue, VAT, and major expense accounts", ""),
    ("Financial", "Bank statements (ZATCA compares receipts with declared sales)", ""),
    ("VAT Returns", "Copies of all filed VAT returns and SADAD payment receipts", "VAT_Returns, ZATCA_Payments"),
    ("VAT Returns", "Voluntary disclosures / corrections filed (Box 14 usage)", "VAT_Returns col AJ"),
    ("Reconciliation", "Revenue per financial statements vs total sales per VAT returns", "Recon_Sales (bottom)"),
    ("Reconciliation", "Sales per VAT box vs sales listing vs GL – by period", "Recon_Sales"),
    ("Reconciliation", "Output VAT per GL vs returns", "Recon_OutputVAT"),
    ("Reconciliation", "Input VAT per GL vs returns", "Recon_InputVAT"),
    ("Reconciliation", "VAT control (payable) account roll-forward", "Recon_VAT_Account"),
    ("Reconciliation", "Customs imports (Bayan data) vs Box 8", "Recon_InputVAT cols L–N"),
    ("Sales", "Sales listing (invoice level) with customer VAT numbers", "Sales_Register"),
    ("Sales", "Sample tax invoices, simplified invoices, credit/debit notes (XML / QR code)", ""),
    ("Sales", "Export evidence: customs exit declarations, bills of lading, contracts, proof of payment", "Sales_Register col N"),
    ("Sales", "Zero-rated domestic supply evidence (e.g. qualifying medicines, intl. transport)", "Sales_Register col N"),
    ("Sales", "Exempt supplies support (financial services margin, residential leases)", ""),
    ("Sales", "Major customer contracts incl. government contracts and VAT clauses", ""),
    ("Sales", "Deemed supplies: free samples, gifts, own use, staff benefits, write-offs", ""),
    ("Sales", "Related-party / intercompany charges and their VAT treatment", ""),
    ("Sales", "Fixed asset & real estate disposals (VAT / RETT treatment)", ""),
    ("Purchases", "Purchase listing (invoice level) with supplier VAT numbers", "Purchase_Register"),
    ("Purchases", "Sample supplier tax invoices supporting input VAT claimed", "Purchase_Register col K"),
    ("Purchases", "Import customs declarations (Bayan) and customs VAT payment proof", "Purchase_Register col M"),
    ("Purchases", "Reverse charge: foreign supplier invoices, contracts, RCM calculation", "Purchase_Register (Box 9)"),
    ("Purchases", "Blocked input VAT analysis (entertainment, vehicles, staff benefits)", "Purchase_Register col G"),
    ("Purchases", "Fixed asset register and capital assets adjustment", ""),
    ("Purchases", "Input VAT apportionment calculation (if exempt supplies exist)", ""),
    ("Cross-tax", "Withholding tax returns (foreign payments should match RCM in Box 9)", ""),
    ("Cross-tax", "Zakat / income tax return revenue vs VAT revenue", ""),
    ("E-invoicing", "E-invoicing compliance: Phase 2 integration wave, cleared/reported invoices report", "Sales_Register col L"),
    ("Response", "Written explanations / memos for every difference found", "Recon sheets"),
]
for i, (area, doc, wbref) in enumerate(CHK):
    r = 5 + i
    put(ws, f"A{r}", i + 1, f_base, INT, align=center)
    put(ws, f"B{r}", area, f_bold)
    put(ws, f"C{r}", doc, f_base, align=wrap)
    put(ws, f"D{r}", wbref, f_link if wbref else f_base)
    for c in "EFGHI": put(ws, f"{c}{r}", None, f_in, DATE if c == "F" else None, fill_in, wrap)
    ws[f"G{r}"] = "Not started"
CN = 5 + len(CHK) - 1
dv_list(ws, LREF["Checklist Status"], f"G5:G{CN}")
ws.conditional_formatting.add(f"G5:G{CN}", FormulaRule(formula=['OR(G5="Ready",G5="Submitted")'], fill=fill_ok))
ws.conditional_formatting.add(f"G5:G{CN}", FormulaRule(formula=['G5="Not started"'], fill=fill_red))
put(ws, "E3", "Readiness:", f_bold, border=False, align=Alignment(horizontal="right"))
put(ws, "F3", f'=(COUNTIF(G5:G{CN},"Ready")+COUNTIF(G5:G{CN},"Submitted")+COUNTIF(G5:G{CN},"N/A"))/COUNTA(G5:G{CN})', f_bold, PCT, fill_tot)
widths(ws, {"A": 5, "B": 15, "C": 70, "D": 26, "E": 14, "F": 13, "G": 13, "H": 26, "I": 30})
ws.freeze_panes = "A5"

# ---------------------------------------------------------------- Dashboard
ws = ws_dash
put(ws, "A1", "ZATCA VAT Inspection Pack – Dashboard", f_title, border=False)
put(ws, "A2", '="Company: "&Setup!B4&"   |   VAT No: "&Setup!B5&"   |   Period: "&TEXT(Setup!C19,"dd-mmm-yyyy")&" to "&TEXT(MAX(Setup!D19:D30),"dd-mmm-yyyy")&"   |   Filing: "&Setup!B8', f_sub, border=False)
r = 4
def section(t):
    global r
    put(ws, f"A{r}", t, f_sec, fill=fill_sec, border=False)
    for c in "BCD": ws[f"{c}{r}"].fill = fill_sec
    r += 1
def kpi(label, fml, fmt=NUM, check=None, note=""):
    global r
    put(ws, f"A{r}", label)
    put(ws, f"B{r}", fml, f_link, fmt, fill_calc)
    put(ws, f"C{r}", check if check else "", f_bold)
    put(ws, f"D{r}", note, f_sub, align=wrap)
    r += 1
    return f"B{r - 1}"

hdr(ws, 3, 1, ["Indicator", "Value (SAR)", "Status", "What it means"])
section("1. Sales & Revenue")
kpi("Total sales per VAT returns (Box 6)", REV_RET.replace("Recon_Sales!", "=Recon_Sales!"))
kpi("Revenue subject to VAT per Trial Balance", "=" + REV_TB)
u = kpi("Unexplained revenue difference", "=" + REV_UNEXPL, NUM,
        f'=IF(ABS(B{r})<=Setup!$B$10,"✓ Reconciled","✗ Explain")', "ZATCA treats unexplained excess revenue as undeclared taxable sales")
kpi("Sales periods/boxes not matched", "=" + "+".join(f'COUNTIF({s},"✗*")' for s in status_ranges[:5]), INT,
    f'=IF(B{r}=0,"✓ None","✗ Review Recon_Sales")')
section("2. Output VAT")
kpi("Output VAT per returns", f"=Recon_OutputVAT!C{OT}")
kpi("Output VAT per GL", f"=Recon_OutputVAT!H{OT}")
under = kpi("Potential under-declared output VAT", f"=Recon_OutputVAT!M{OT}", NUM,
            f'=IF(B{r}<=Setup!$B$10,"✓ None","✗ Exposure")', "Higher of register or GL above the return, per period")
section("3. Input VAT")
kpi("Input VAT claimed per returns", f"=Recon_InputVAT!C{IT}")
kpi("Defensible input VAT per register", f"=Recon_InputVAT!E{IT}")
over = kpi("Potential over-claimed input VAT", f"=Recon_InputVAT!K{IT}", NUM,
           f'=IF(B{r}<=Setup!$B$10,"✓ None","✗ Exposure")', "Claimed in return but not supported by a valid, non-blocked invoice")
section("4. VAT Account, Filing & Payment")
kpi("Returns filed late", f'=COUNTIF(VAT_Returns!AT{R1}:AT{RN},"✗*")', INT, f'=IF(B{r}=0,"✓ None","✗ Late")')
kpi("Return arithmetic errors", f'=COUNTIF(VAT_Returns!AS{R1}:AS{RN},"✗*")', INT, f'=IF(B{r}=0,"✓ None","✗ Check")')
kpi("VAT unpaid (outstanding)", f"=Recon_VAT_Account!G{VT}", NUM, f'=IF(B{r}<=Setup!$B$10,"✓ Settled","✗ Unpaid")')
kpi("GL VAT account periods not agreeing", f'=COUNTIF({status_ranges[-1]},"✗*")', INT, f'=IF(B{r}=0,"✓ None","✗ Investigate")')
lp = kpi("Est. late payment penalties", f"=Recon_VAT_Account!I{VT}+Recon_VAT_Account!J{VT}", NUM, None, "5% per month or part on late / unpaid tax")
section("5. Data Quality")
kpi("Sales rows with exceptions", "=Sales_Register!B3", INT, f'=IF(B{r}=0,"✓ Clean","✗ Review flags")')
kpi("Purchase rows with exceptions", "=Purchase_Register!B3", INT, f'=IF(B{r}=0,"✓ Clean","✗ Review flags")')
kpi("TB months out of balance", '=COUNTIF(TB_Monthly!E3:S3,"<>0")', INT, f'=IF(B{r}=0,"✓ Balanced","✗ Fix TB")')
kpi("TB accounts without VAT mapping", f'=SUMPRODUCT((TB_Monthly!A{TB1}:A{TBN}<>"")*(TB_Monthly!D{TB1}:D{TBN}=""))', INT, f'=IF(B{r}=0,"✓ All mapped","✗ Map accounts")')
kpi("Document checklist readiness", "=Checklist!F3", PCT, f'=IF(B{r}>=1,"✓ Ready","✗ Incomplete")')
section("6. Indicative Exposure (before objection / penalty relief)")
tax = kpi("Tax exposure (under-declared + over-claimed + unexplained revenue × rate)",
          f"={under}+{over}+MAX(0,{u})*Setup!$B$9", NUM, None,
          "Unexplained revenue (TB > returns) × 15%. Indicative only")
pen = kpi("Incorrect-return penalty on tax exposure", f"={tax}*Setup!$B$13", NUM, None, "Art. 42 – 50% of the difference (indicative)")
kpi("Late payment penalties (est.)", f"={lp}")
tot = kpi("TOTAL INDICATIVE EXPOSURE", f"={tax}+{pen}+{lp}", NUM, f'=IF(B{r}<=Setup!$B$10,"✓ Low risk","✗ Prepare defence / consider voluntary disclosure")')
ws[tot].font = Font(name=F, size=11, bold=True, color="C00000")
status_cf(ws, f"C5:C{r}")
widths(ws, {"A": 62, "B": 20, "C": 34, "D": 62})
put(ws, f"A{r + 1}", "Legend: yellow cells with blue text = inputs · grey = formulas · green text = links to other sheets · ✓ = OK · ✗ = needs action. "
    "All amounts in SAR. Example rows (Jan 2025) are included to show the format – overwrite them with your data.", f_sub, border=False)
ws.merge_cells(f"A{r + 1}:D{r + 1}"); ws[f"A{r + 1}"].alignment = wrap; ws.row_dimensions[r + 1].height = 30

# ---------------------------------------------------------------- Inspection_Guide
ws = ws_g
put(ws, "A1", "ZATCA VAT Inspection – Practical Guide", f_title, border=False)
put(ws, "A2", "Rules summarised from the KSA VAT Law & Implementing Regulations. Confirm current rates, penalties and deadlines with ZATCA or your advisor before relying on them.", f_sub, border=False)
G = [
    ("HOW TO USE THIS WORKBOOK", None),
    ("1", "Setup: enter company details, the audit year start date and filing frequency. Periods generate automatically."),
    ("2", "TB_Monthly: paste opening balances and monthly net movements (Dr +, Cr −). Map EVERY account in column D – this drives all GL reconciliations."),
    ("3", "VAT_Returns: copy every filed return box-by-box from the ZATCA portal, including filing date. Check columns AS–AU."),
    ("4", "Sales_Register / Purchase_Register: export invoice-level data from the ERP or FATOORA. For very high volumes (POS), use daily summary lines per VAT category."),
    ("5", "ZATCA_Payments: enter each SADAD payment and any refunds (negative)."),
    ("6", "Work through every ✗ on Recon_Sales, Recon_OutputVAT, Recon_InputVAT and Recon_VAT_Account. Document each explanation."),
    ("7", "Use the Checklist to collect evidence; the Dashboard shows overall readiness and indicative exposure."),
    ("WHAT ZATCA TYPICALLY TESTS", None),
    ("•", "Revenue in audited financial statements / Zakat return vs total sales in VAT returns (the #1 test)."),
    ("•", "Bank receipts vs declared sales; customs import data vs Box 8; withholding-tax returns vs Box 9 (reverse charge)."),
    ("•", "Zero-rated and export sales: proof the goods left KSA (customs exit) or the service conditions were met."),
    ("•", "Input VAT: valid tax invoice in the company's name with a valid supplier VAT number; no blocked items."),
    ("•", "Credit notes: valid reason, issued correctly, linked to the original invoice."),
    ("•", "Deemed supplies: gifts, samples, own use, staff benefits, asset write-offs."),
    ("•", "E-invoicing: invoices generated/cleared/reported through a compliant solution with required fields and QR code."),
    ("•", "Timeliness of filing and payment; use of Box 14 above the SAR 5,000 limit."),
    ("COMMON FINDINGS IN KSA VAT AUDITS", None),
    ("•", "Revenue booked in GL but not declared (accruals, other income, recharges, asset sales)."),
    ("•", "Exports zero-rated without exit evidence → reassessed at 15%."),
    ("•", "Input VAT claimed on invoices without supplier VAT number, in another entity's name, or on simplified invoices above limits."),
    ("•", "Reverse charge not applied on foreign services (consulting, software, royalties, management fees)."),
    ("•", "Customs VAT claimed where the company is not the importer of record."),
    ("•", "Blocked input VAT claimed: entertainment, hospitality, private-use vehicles, staff personal benefits."),
    ("•", "Errors above SAR 5,000 corrected through Box 14 instead of a voluntary disclosure."),
    ("KEY RULES & PENALTIES (verify current position)", None),
    ("Filing", "Monthly if taxable supplies exceed SAR 40 million a year, otherwise quarterly. Return and payment due by the last day of the following month."),
    ("Late filing", "5% to 25% of the tax due (VAT Law Art. 43)."),
    ("Late payment", "5% of the unpaid tax for each month or part of a month (VAT Law Art. 43)."),
    ("Incorrect return", "50% of the difference between the tax calculated and the tax due (VAT Law Art. 42)."),
    ("Tax evasion", "Up to three times the value of the goods or services concerned (VAT Law Art. 40)."),
    ("Corrections", "Net errors above SAR 5,000 → voluntary disclosure (within 20 days of discovery). Errors up to SAR 5,000 can be corrected in Box 14 of the next return."),
    ("Records", "Keep records at least 6 years; capital assets 11 years; real estate 15 years."),
    ("Assessment window", "ZATCA can generally assess within 5 years from the end of the tax period (10 years where no return was filed or in cases of evasion)."),
    ("Objection", "File an objection against an assessment within the statutory deadline (currently 60 days from notification – verify), then escalate to the GSTC committees if needed."),
    ("Relief", "Check whether a ZATCA penalty-waiver / amnesty initiative is currently active – these have been extended several times."),
    ("RESPONSE TIPS", None),
    ("•", "Answer only what is requested, in writing, within the deadline in the ZATCA notice; ask for an extension in writing if needed."),
    ("•", "Never submit a reconciliation with unexplained differences – fix or explain every ✗ first."),
    ("•", "Keep one index of everything submitted (Checklist col H) and the date it was sent."),
    ("•", "If you find an error before ZATCA does, assess whether a voluntary disclosure reduces the penalty."),
    ("•", "Get your tax advisor to review the pack before submission."),
]
r = 4
for k, v in G:
    if v is None:
        put(ws, f"A{r}", k, f_sec, fill=fill_sec, border=False); ws[f"B{r}"].fill = fill_sec; r += 1; continue
    put(ws, f"A{r}", k, f_bold, align=Alignment(vertical="top"), border=False)
    put(ws, f"B{r}", v, f_base, align=wrap, border=False)
    ws.row_dimensions[r].height = 28 if len(v) > 110 else 16
    r += 1
widths(ws, {"A": 18, "B": 120})

wb.active = 0
for s in wb.worksheets:
    s.sheet_view.zoomScale = 90
from openpyxl.workbook.properties import CalcProperties
wb.calculation = CalcProperties(fullCalcOnLoad=True)
wb.save(OUT)
print("saved")




