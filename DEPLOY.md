# Deploy Fahs as a web app with Google Sheets storage

Time needed: about 10 minutes. You need a Google account (personal Gmail or Google Workspace).

## 1. Create the database sheet
1. Go to [sheets.new](https://sheets.new) to create a blank Google Sheet.
2. Name it, for example **Fahs – VAT Inspection 2025**.

## 2. Add the code
1. In the sheet, open **Extensions → Apps Script**.
2. In the editor, replace everything in `Code.gs` with the contents of [`webapp/Code.gs`](webapp/Code.gs).
3. Click **+ → HTML**, name the file exactly `Index` (the editor adds `.html`), and paste the contents of [`webapp/Index.html`](webapp/Index.html).
4. Click **Save**.

## 3. Run setup once
1. In the function list at the top, choose **setup** and click **Run**.
2. Google asks for permission. Click **Review permissions**, choose your account and **Allow**. (If you see "Google hasn't verified this app", click **Advanced → Go to project (unsafe)**. It is your own script.)
3. Back in the sheet you will now see the tabs: Settings, TrialBalance, VATReturns, SalesRegister, PurchaseRegister, and so on, plus **AuditLog**.

## 4. Deploy the web app
1. Click **Deploy → New deployment**.
2. Click the gear icon and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Only myself (recommended for tax data). For a team in Google Workspace choose **Anyone within [your organisation]**.
4. Click **Deploy** and copy the **Web app URL**. That is your system's address. Bookmark it.

## 5. First use
Open the URL. The app says the sheet is connected and empty. Choose **Start with example data** to explore, or **Start empty** to load your own data. Every change saves to the Google Sheet within about two seconds; the status chip in the top bar shows "Saved to Google Sheets".

## Updating to a new version
Paste the new `Index.html` (and `Code.gs` if it changed), then **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The URL stays the same.

## Security notes
- The data lives only in your Google Sheet, under your Google account. Nothing is sent anywhere else.
- Anyone you share the Google Sheet with can read the data, so share it carefully.
- The AuditLog tab records the time, user and datasets of every save.

---

# نشر «فحص» كتطبيق ويب مع التخزين في جداول Google

الوقت المطلوب: حوالي 10 دقائق. تحتاج إلى حساب Google.

## 1. إنشاء جدول قاعدة البيانات
1. افتح [sheets.new](https://sheets.new) لإنشاء جدول Google فارغ.
2. سمّه مثلاً **فحص – ضريبة القيمة المضافة 2025**.

## 2. إضافة الكود
1. من الجدول افتح **الإضافات ← Apps Script**.
2. استبدل محتوى `Code.gs` بمحتوى الملف [`webapp/Code.gs`](webapp/Code.gs).
3. اضغط **+ ← HTML** وسمِّ الملف `Index` تماماً، ثم الصق محتوى [`webapp/Index.html`](webapp/Index.html).
4. اضغط **حفظ**.

## 3. تشغيل الإعداد مرة واحدة
1. من قائمة الدوال اختر **setup** ثم **تشغيل**.
2. سيطلب Google الإذن: **مراجعة الأذونات** ثم اختر حسابك ثم **سماح**. (إذا ظهرت رسالة «لم يتحقق Google من هذا التطبيق» اضغط **متقدم ← الانتقال إلى المشروع**، فهو برنامجك الخاص.)
3. ستظهر في الجدول أوراق البيانات وورقة **AuditLog** لسجل التدقيق.

## 4. نشر تطبيق الويب
1. اضغط **نشر ← نشر جديد**.
2. اضغط أيقونة الترس واختر **تطبيق ويب**.
3. اضبط:
   - **التنفيذ باسم:** أنا
   - **من يمكنه الوصول:** أنا فقط (موصى به للبيانات الضريبية)، أو «أي شخص داخل مؤسستك» لفريق عمل.
4. اضغط **نشر** وانسخ **رابط تطبيق الويب**. هذا هو عنوان نظامك.

## 5. أول استخدام
افتح الرابط واختر **البدء ببيانات توضيحية** أو **البدء بجداول فارغة**. يُحفظ كل تغيير في جدول Google خلال ثانيتين تقريباً.
