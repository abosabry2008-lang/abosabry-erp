/**
 * Copies the committed Flutter web build (`erp/web`) into `erp/backend/public`
 * so Netlify can serve it as the site's publish directory while the build base
 * stays inside `erp/backend` (where node_modules and the Prisma client live).
 *
 * Run by the Netlify build command, or manually: npm run stage:web
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '..');
const source = path.resolve(backendRoot, '..', 'web');
const target = path.resolve(backendRoot, 'public');

if (!fs.existsSync(path.join(source, 'index.html'))) {
  throw new Error(`Missing Flutter web build at ${source} (expected index.html).`);
}

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
console.log(`[stage:web] copied ${source} -> ${target}`);
