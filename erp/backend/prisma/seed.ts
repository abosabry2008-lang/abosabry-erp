/**
 * Minimal seed for a fresh installation.
 *
 * It creates ONLY the foundation the app needs to start:
 *   - the settings row (company profile, defaults)
 *   - the base currency
 *   - the default chart of accounts
 *   - optionally, the first ADMIN user (ADMIN_EMAIL / ADMIN_PASSWORD)
 *
 * It never creates products, customers, suppliers, invoices, orders or any
 * other business records, and it never deletes existing data. Safe to re-run.
 *
 * Usage:
 *   npm run prisma:push        (create the schema)
 *   npm run seed               (this script)
 *
 * Optional environment variables:
 *   COMPANY_NAME       e.g. "Acme Trading Co."       (default: My Company)
 *   COMPANY_CURRENCY   ISO code, e.g. "EGP" / "USD"   (default: USD)
 *   ADMIN_EMAIL        e.g. "admin@example.com"       (skipped if unset)
 *   ADMIN_PASSWORD     a strong password              (skipped if unset)
 *   ADMIN_NAME         display name                   (default: Administrator)
 *
 * To load the old demo dataset instead, run: npm run seed:demo
 * (WARNING: the demo seed deletes every row before loading sample data.)
 */
import { hashPassword } from '../src/lib/password';
import { prisma } from '../src/lib/prisma';
import { getSettings } from '../src/lib/settings';
import { ensureDefaultAccounts } from '../src/modules/accounting/accounting.service';

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

async function seedSettings(): Promise<string> {
  // Creates the single settings row (id = 1) with schema defaults if missing.
  const current = await getSettings();

  const companyName = optional('COMPANY_NAME');
  const currencyCode = (optional('COMPANY_CURRENCY') ?? current.baseCurrencyCode ?? 'USD')
    .toUpperCase()
    .slice(0, 3);

  await prisma.setting.update({
    where: { id: 1 },
    data: {
      ...(companyName ? { companyName } : {}),
      baseCurrencyCode: currencyCode,
    },
  });

  console.log(`[seed] settings ready (company: ${companyName ?? current.companyName}, base currency: ${currencyCode})`);
  return currencyCode;
}

async function seedCurrency(code: string): Promise<void> {
  await prisma.currency.upsert({
    where: { code },
    update: { isBase: true, active: true },
    create: { code, name: code, symbol: code, isBase: true },
  });

  // Only one currency may be the base currency.
  await prisma.currency.updateMany({
    where: { code: { not: code } },
    data: { isBase: false },
  });

  console.log(`[seed] base currency ready (${code})`);
}

async function seedAccounts(): Promise<void> {
  await prisma.$transaction((tx) => ensureDefaultAccounts(tx));
  console.log('[seed] chart of accounts ready');
}

async function seedAdmin(): Promise<void> {
  const email = optional('ADMIN_EMAIL');
  const password = optional('ADMIN_PASSWORD');

  if (!email || !password) {
    console.log('[seed] no ADMIN_EMAIL / ADMIN_PASSWORD set — skipped creating the admin user.');
    console.log('[seed] To create it later, set both variables and re-run: npm run seed');
    return;
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters long.');
  }

  const name = optional('ADMIN_NAME') ?? 'Administrator';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`[seed] user ${email} already exists — left unchanged.`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name,
      role: 'ADMIN',
      passwordHash: await hashPassword(password),
    },
  });

  console.log(`[seed] ADMIN user created (${email})`);
}

async function main(): Promise<void> {
  console.log('[seed] starting minimal seed (no business data will be created)...');

  await seedAccounts();
  const currencyCode = await seedSettings();
  await seedCurrency(currencyCode);
  await seedAdmin();

  console.log('\n[seed] done. The database is ready for real data.');
  console.log('[seed] Sign in with the ADMIN account, then fill in Settings → Company.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
