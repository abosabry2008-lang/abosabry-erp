# نسخة مستقلة من نظام ERP (بدون بيانات)

ده مستودع **نسخة مستقلة** من مشروع `abosabry`، مخصص للبدء من الصفر بقاعدة بيانات
جديدة. المستودع الأصلي لم يُلمس إطلاقًا.

## إيه اللي اتغيّر في النسخة دي؟

| البند | الحالة |
| --- | --- |
| قاعدة البيانات | جديدة وفاضية — مش نسخة من بيانات التشغيل الحالية |
| `npm run seed` | بيجهّز **إعدادات الشركة + العملة الأساسية + دليل الحسابات** فقط |
| `npm run seed:demo` | بيانات عرض تجريبية (منتجات/فواتير) — **اختياري تمامًا** ويمسح البيانات قبل التحميل |
| الأسرار | مفيش أي `.env` أو توكنات داخل المستودع |
| تاريخ Git | نظيف — Commit واحد فقط |
| نسخة الويب المبنية | `erp/web` بتستخدم `/api/v1` نسبيًا، يعني بتتصل بسيرفر نفس الموقع |

## المتطلبات

- Node.js 18.18+
- قاعدة بيانات PostgreSQL (مثل Neon أو Render Postgres)
- (اختياري) Flutter SDK لو هتعدّل تطبيق الموبايل/الويب

## التشغيل محليًا

```powershell
cd erp\backend
Copy-Item .env.example .env
# عدّل DATABASE_URL و JWT secrets في .env

npm install
npx prisma generate
npx prisma db push

# أول مستخدم أدمن + إعدادات الشركة
$env:COMPANY_NAME="اسم شركتك"
$env:COMPANY_CURRENCY="EGP"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="كلمة-سر-قوية"
npm run seed

npm run dev
```

الـ API هيشتغل على `http://localhost:4000`، والويب موجود جاهز في `erp/web`.

## النشر على Netlify + Neon

المشروع مجهّز بالكامل لـ Netlify:
- `netlify.toml` — يضبط الـ base والبناء وredirects
- `erp/backend/netlify/functions/api.js` — الـ API كـ Serverless Function
- `erp/backend/scripts/stage-web.mjs` — ينسخ واجهة Flutter لمجلد النشر

الخطوات:

1. اعمل قاعدة بيانات على <https://neon.tech> وخُد **Pooled connection string**.
2. على <https://app.netlify.com/start> اختار GitHub ثم المستودع `abosabry-erp`.
   (لو المستودع مش ظاهر: **Configure Netlify on GitHub** وامنح الوصول له.)
3. اترك إعدادات البناء كما هي — Netlify هيقرأها من `netlify.toml`.
4. قبل النشر، من **Site configuration → Environment variables** أضف:
   - `DATABASE_URL` — رابط Neon (بينتهي بـ `?sslmode=require`)
   - `JWT_ACCESS_SECRET` و `JWT_REFRESH_SECRET` — قيم عشوائية قوية
5. Deploy، وبعد ما يخلص اختبر `https://<site>.netlify.app/api/v1/health`.

> لو قاعدة البيانات لسه فاضية، شغّل الـ schema والـ seed مرة واحدة من جهازك بنفس `DATABASE_URL`:
>
> ```powershell
> cd erp\backend
> $env:DATABASE_URL="postgresql://...@...neon.tech/neondb?sslmode=require"
> $env:ADMIN_EMAIL="admin@example.com"
> $env:ADMIN_PASSWORD="كلمة-سر-قوية"
> npx prisma db push --skip-generate
> npm run seed
> ```
>
> لو حبيت تجرب ببيانات عرض: `npm run seed:demo` (بيمسح أي بيانات موجودة).

### ملاحظات Netlify

- كل طلب في Serverless Function له حد زمني (10 ثوانٍ على الخطة المجانية تقريبًا)،
  فعمليات زي استيراد Excel الكبير ممكن تحتاج خطة أعلى أو استضافة Container.
- أول طلب بعد فترة خمول بيكون أبطأ (Cold start).

## ملاحظات

- المستودع **مافيهوش** أي بيانات عملاء أو فواتير أو مستخدمين من النظام القديم.
- المستودع القديم `abosabry` باقي زي ما هو على GitHub ومن غير أي تعديل.
- لتغيير اسم الشركة لاحقًا: Settings ← Company داخل التطبيق.
