import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Local files only: this suite never contacts the live site or sends email.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist-production');
let checks = 0;
const check = (actual, expected, label) => { assert.equal(actual, expected, label); checks++; };
const config = JSON.parse(await readFile(join(root, 'wrangler.production.jsonc'), 'utf8'));
check(config.name, 'timgabaree-com-astro-production', 'separate Worker');
check(config.account_id, '7459bd2037d71d23fd030e3542b9df61', 'intended account');
check(config.vars.ENVIRONMENT, 'production', 'production runtime');
check(config.vars.PRODUCTION_ENABLED, 'false', 'preparation must remain locked');
check(config.vars.CONTACT_MODE, 'resend', 'no dry-run success in production');
check(config.workers_dev, false, 'no public workers.dev address');
check(config.preview_urls, false, 'no public preview URLs');
check(config.routes.length, 0, 'no live-domain routes');
check(config.assets.directory, './dist-production', 'separate production assets');
check(config.assets.run_worker_first, true, 'all assets behind launch gate');
check(config.durable_objects.bindings[0].script_name, undefined, 'no cross-Worker state sharing');
for (const key of ['RESEND_API_KEY', 'CONTACT_FROM', 'CONTACT_TO', 'STAGING_PASSWORD', 'STAGING_USER']) {
  check(Object.hasOwn(config.vars, key), false, `${key} not embedded`);
}

const publicPages = ['index', 'about', 'contact', 'governance', 'privacy', 'technology-leadership', 'value-creation'];
const allPages = [...publicPages, 'thank-you', '404'];
const internal = new Set();
for (const page of allPages) {
  const html = await readFile(join(output, `${page}.html`), 'utf8');
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1];
  assert.ok(robots, `${page} has robots metadata`); checks++;
  check(robots.includes('noindex'), !publicPages.includes(page), `${page} correct indexing`);
  check(html.includes('src="/js/analytics.js"'), true, `${page} production analytics loader`);
  check(html.includes('googletagmanager.com/ns.html'), false, `${page} no consent-bypassing iframe`);
  check(html.includes('href="https://www.googletagmanager.com"'), false, `${page} no pre-consent Google connection`);
  check(html.includes('data-analytics-panel'), true, `${page} analytics choice panel`);
  check(html.includes('data-analytics-enabled="true"'), true, `${page} production analytics permission gate`);
  check(html.includes('data-analytics-open'), true, `${page} persistent privacy control`);
  check(html.includes('Staging site notice'), false, `${page} no staging notice`);
  if (page !== '404') {
    const expected = `https://timgabaree.com/${page === 'index' ? '' : page}`;
    check(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1], expected, `${page} canonical`);
  }
  for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    JSON.parse(match[1]); checks++;
  }
  for (const match of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    internal.add(new URL(match[1], 'https://timgabaree.com').pathname);
  }
}
for (const path of internal) {
  const relative = decodeURIComponent(path.slice(1));
  const candidates = path === '/' ? ['index.html'] : [relative, `${relative}.html`];
  const exists = await Promise.all(candidates.map(p => stat(join(output, p)).then(s => s.isFile()).catch(() => false)));
  assert.ok(exists.some(Boolean), `Missing linked page or asset: ${path}`); checks++;
}
const robots = await readFile(join(output, 'robots.txt'), 'utf8');
assert.doesNotMatch(robots, /Disallow:\s*\//); checks++;
assert.match(robots, /Sitemap: https:\/\/timgabaree\.com\/sitemap.xml/); checks++;
const sitemap = await readFile(join(output, 'sitemap.xml'), 'utf8');
for (const page of publicPages) {
  assert.ok(sitemap.includes(`<loc>https://timgabaree.com/${page === 'index' ? '' : page}</loc>`), `${page} in sitemap`); checks++;
}
assert.doesNotMatch(sitemap, /<loc>[^<]*(?:thank-you|404|workers\.dev)/); checks++;
const privacy = await readFile(join(output, 'privacy.html'), 'utf8');
assert.doesNotMatch(privacy, /GoDaddy Hosting|Staging site notice/); checks++;
assert.match(privacy, /Resend/); checks++;
assert.match(privacy, /Cloudflare/); checks++;
assert.match(privacy, /2026-10-27/); checks++;
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert.equal(entry.isSymbolicLink(), false, 'no symlinks in build');
    if (entry.isDirectory()) await inspect(join(directory, entry.name));
    else assert.ok(!/\.php$/i.test(entry.name) && (!entry.name.startsWith('.') || entry.name === '.assetsignore'), `Non-public file: ${entry.name}`);
  }
}
await inspect(output); checks++;
console.log(`${checks} production build/configuration checks passed. Launch remains locked; no DNS changes or email sent.`);
