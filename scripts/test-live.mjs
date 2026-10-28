import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Read-only launch checks. Never submits a form, changes DNS, or sends email.
const base = 'https://timgabaree.com';
let checks = 0;
const check = (actual, expected, label) => { assert.equal(actual, expected, label); checks++; };
const request = (url, method = 'GET') => fetch(url, {
  method, redirect: 'manual', signal: AbortSignal.timeout(30_000),
});
const pages = ['', 'about', 'contact', 'governance', 'privacy', 'sitemap', 'technology-leadership', 'value-creation'];
for (const page of [...pages, 'thank-you']) {
  const response = await request(`${base}/${page}`);
  check(response.status, 200, `page ${page || 'home'}`);
  const html = await response.text();
  check(html.includes('data-analytics-enabled="true"'), true, 'production Astro assets');
  assert.match(html, /<section[^>]*data-analytics-panel[^>]* hidden(?:[ >])/, 'JS controls saved cookie choice'); checks++;
  check(html.includes('Allow cookies'), true, 'compact cookie notice');
  const csp = response.headers.get('content-security-policy') ?? '';
  assert.match(csp, /script-src[^;]*https:\/\/static\.cloudflareinsights\.com/); checks++;
  assert.match(csp, /connect-src[^;]*https:\/\/cloudflareinsights\.com/); checks++;
  check(html.includes('href="/sitemap"'), true, 'HTML sitemap linked');
  check(html.includes('Staging site notice'), false, 'no staging notice');
  check(html.includes('googletagmanager.com/ns.html'), false, 'no consent-bypassing iframe');
  check(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1], `${base}/${page}`, 'canonical');
  check(response.headers.get('x-content-type-options'), 'nosniff', 'nosniff');
  check(response.headers.get('x-frame-options'), 'SAMEORIGIN', 'frame protection');
  assert.match(response.headers.get('content-security-policy') ?? '', /frame-ancestors 'self'/); checks++;
  assert.match(response.headers.get('strict-transport-security') ?? '', /max-age=31536000/); checks++;
  check((response.headers.get('x-robots-tag') ?? '').includes('noindex'), page === 'thank-you', 'indexing header');
  check((html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '').includes('noindex'), page === 'thank-you', 'indexing metadata');
}
for (const origin of ['http://timgabaree.com', 'http://www.timgabaree.com', 'https://www.timgabaree.com']) {
  const response = await request(`${origin}/contact?launch=check%20only`);
  check(response.status, 308, 'canonical redirect');
  check(response.headers.get('location'), `${base}/contact?launch=check%20only`, 'path/query retained');
  await response.body?.cancel();
}
for (const page of pages) {
  const response = await request(`${base}/${page || 'index'}.php?launch=1`);
  check(response.status, 301, 'legacy redirect');
  check(response.headers.get('location'), `/${page}?launch=1`, 'legacy destination');
  await response.body?.cancel();
}
for (const path of ['/not-a-real-launch-page', '/.env', '/includes/config.php', '/worker/index.ts', '/server-php/contact-submit.php']) {
  const response = await request(base + path);
  check(response.status, 404, `not exposed ${path}`);
  assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/); checks++;
  await response.body?.cancel();
}
const robots = await (await request(`${base}/robots.txt`)).text();
assert.match(robots, /Sitemap: https:\/\/timgabaree\.com\/sitemap.xml/); checks++;
// Cloudflare may prepend managed bot-specific directives; validate our general group.
assert.match(robots, /User-agent: \*\s+Allow: \//); checks++;
const sitemap = await (await request(`${base}/sitemap.xml`)).text();
for (const page of pages) { assert.ok(sitemap.includes(`<loc>${base}/${page}</loc>`)); checks++; }
assert.doesNotMatch(sitemap, /workers\.dev|thank-you|404/); checks++;
assert.doesNotMatch(sitemap, /xml-stylesheet|\.xsl/i); checks++;
const sitemapPage = await (await request(`${base}/sitemap`)).text();
for (const page of pages) { check(sitemapPage.includes(`href="/${page}"`), true, 'HTML sitemap page link'); }
check((await request(`${base}/sitemap.xsl`, 'HEAD')).status, 404, 'obsolete XSL removed');
for (const file of ['timgabaree.vcf', 'armypubs/cmhPub_70-128.pdf', 'armypubs/AH104(W).pdf', 'armypubs/AH106(W).pdf']) {
  const response = await request(`${base}/${file}`);
  check(response.status, 200, `download ${file}`);
  const downloaded = Buffer.from(await response.arrayBuffer());
  const source = await readFile(new URL(`../public/${file}`, import.meta.url));
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  check(hash(downloaded), hash(source), `download integrity ${file}`);
}
for (const [url, status] of [
  ['https://timgabaree-com-astro-production.timgabaree-com-astro.workers.dev/', 404],
  ['https://timgabaree-com-astro-staging.timgabaree-com-astro.workers.dev/', 401],
  ['https://timgabaree-com-astro-email-monitor.timgabaree-com-astro.workers.dev/health', 200],
  ['https://timgabaree-com-astro-email-monitor.timgabaree-com-astro.workers.dev/delivery-status', 200],
]) {
  const response = await request(url, 'HEAD'); check(response.status, status, url);
}
console.log(`${checks} live launch checks passed. No form submission or email sent.`);
