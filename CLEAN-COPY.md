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

## النشر على Vercel + Neon

1. اعمل قاعدة بيانات جديدة على <https://neon.tech> وخُد **Pooled connection string**.
2. على <https://vercel.com/new> اختار المستودع الجديد (مش القديم).
3. أضف متغيرات البيئة:
   - `DATABASE_URL` — رابط Neon (بينتهي بـ `?sslmode=require`)
   - `JWT_ACCESS_SECRET` و `JWT_REFRESH_SECRET` — قيم عشوائية قوية
4. Deploy.
5. بعد أول نشر، شغّل الـ seed مرة واحدة من جهازك مع نفس `DATABASE_URL`:

```powershell
cd erp\backend
$env:DATABASE_URL="postgresql://...@...neon.tech/neondb?sslmode=require"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="كلمة-سر-قوية"
npx prisma db push --skip-generate
npm run seed
```

> لو حبيت تجرب ببيانات عرض: `npm run seed:demo` (بيمسح أي بيانات موجودة).

## ملاحظات

- المستودع **مافيهوش** أي بيانات عملاء أو فواتير أو مستخدمين من النظام القديم.
- المستودع القديم `abosabry` باقي زي ما هو على GitHub ومن غير أي تعديل.
- لتغيير اسم الشركة لاحقًا: Settings ← Company داخل التطبيق.
