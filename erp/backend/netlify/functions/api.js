/**
 * Netlify Functions entry point.
 *
 * Wraps the existing Express app (the same one Render/Docker run) with
 * `serverless-http`, so the REST API keeps working unchanged on Netlify.
 *
 * `netlify.toml` rewrites `/api/*` to this function. Netlify may hand us the
 * rewritten path (`/.netlify/functions/api/...`), so we normalise it back to
 * the original `/api/...` path before Express sees it.
 */
const serverless = require('serverless-http');

// Compiled by `npm run build` (tsc) before Netlify bundles this function.
const { createApp } = require('../../dist/app');

const app = createApp();
const handler = serverless(app);

const FUNCTION_PREFIX = '/.netlify/functions/api';

function normalizePath(pathname) {
  if (!pathname) return '/api';
  if (pathname === FUNCTION_PREFIX) return '/api';
  if (pathname.startsWith(`${FUNCTION_PREFIX}/`)) {
    return `/api${pathname.slice(FUNCTION_PREFIX.length)}`;
  }
  return pathname;
}

exports.handler = async (event, context) => {
  const normalized = { ...event, path: normalizePath(event.path) };
  return handler(normalized, context);
};
