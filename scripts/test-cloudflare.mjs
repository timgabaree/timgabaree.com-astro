import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const temp = await mkdtemp(join(tmpdir(), 'astro-worker-test-'));
const base = 'http://127.0.0.1:8791';
let output = '';
let checks = 0;
let ready = false;
const child = spawn(process.execPath, [
  'node_modules/wrangler/bin/wrangler.js', 'dev', '--ip', '127.0.0.1', '--port', '8791',
  '--var', 'ENVIRONMENT:local', '--var', 'CONTACT_MODE:dry-run', '--persist-to', temp,
], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
child.stdout.on('data', (data) => { output += data; if (output.includes(`Ready on ${base}`)) ready = true; });
child.stderr.on('data', (data) => { output += data; });
const request = (path, init = {}) => fetch(base + path, { ...init, redirect: 'manual' });
const check = (actual, expected, label) => { assert.equal(actual, expected, label); checks++; };

try {
  for (let attempt = 0; attempt < 120 && !ready; attempt++) {
    if (child.exitCode !== null) throw new Error(output);
    await delay(250);
  }
  assert.ok(ready, `Local Worker did not start: ${output}`);
  for (const page of ['/', '/about', '/contact', '/governance', '/privacy', '/technology-leadership', '/thank-you', '/value-creation']) {
    const response = await request(page);
    check(response.status, 200, page);
    check(response.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive', `${page} noindex`);
    const html = await response.text();
    assert.ok(!html.includes('googletagmanager.com/ns.html'), 'No analytics iframe on staging');
    assert.ok(!html.includes('src="/js/analytics.js"'), 'No analytics loader on staging');
    checks += 2;
  }
  check((await request('/does-not-exist')).status, 404, 'real missing-page status');
  for (const path of ['/includes/config.php', '/.git/config', '/.env', '/css/.htaccess', '/server-php/contact-submit.php', '/worker/index.ts', '/random.php']) {
    check((await request(path)).status, 404, `private ${path}`);
  }
  for (const [path, target] of [['/index.php', '/'], ['/about.php?a=1', '/about?a=1'], ['/contact.html', '/contact'], ['/privacy/', '/privacy']]) {
    const response = await request(path);
    check(response.status, 301, path);
    check(response.headers.get('Location'), target, `${path} redirect`);
  }
  check((await request('/contact-submit')).status, 405, 'POST only');
  check((await request('/contact-conversion')).status, 405, 'conversion POST only');
  check((await request('/contact-token', { headers: { Origin: 'https://attacker.invalid' } })).status, 403, 'cross origin token');
  const response = await request('/contact-token');
  const token = await response.json();
  const cookie = response.headers.get('Set-Cookie').split(';')[0];
  check(token.test_mode, true, 'dry-run flag');
  assert.match(token.csrf_token, /^[a-f0-9]{64}$/); checks++;
  const headers = { Origin: base, Cookie: cookie, 'Content-Type': 'application/x-www-form-urlencoded' };
  const form = { csrf_token: token.csrf_token, name: 'Staging Test', email: 'test@example.invalid', topic: 'other', message: 'Synthetic test only', website: '' };
  const submit = (fields = {}, extraHeaders = {}) => request('/contact-submit', {
    method: 'POST', headers: { ...headers, ...extraHeaders }, body: new URLSearchParams({ ...form, ...fields }),
  });
  check((await submit({}, { Origin: 'https://attacker.invalid' })).headers.get('Location'), '/contact?status=invalid', 'cross origin submit');
  check((await submit({ csrf_token: 'a'.repeat(64) })).headers.get('Location'), '/contact?status=security-error', 'bad CSRF');
  check((await submit({ name: '' })).headers.get('Location'), '/contact?status=missing', 'required fields');
  check((await submit()).headers.get('Location'), '/contact?status=test-success', 'real runtime no-email submission');
  check((await submit()).headers.get('Location'), '/contact?status=security-error', 'token replay');
  const conversion = await request('/contact-conversion?submitted=1', { method: 'POST', headers });
  check((await conversion.json()).converted, false, 'dry run never records conversion');
  check((await submit()).headers.get('Location'), '/contact?status=security-error', 'last allowed attempt');
  check((await submit()).headers.get('Location'), '/contact?status=rate-limited', 'persistent IP rate limit');
  assert.match(await (await request('/robots.txt')).text(), /Disallow: \//); checks++;
  async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await inspect(path);
      else assert.ok(!/\.php$/i.test(entry.name) && entry.name !== '.htaccess', `Private file in build: ${path}`);
    }
  }
  await inspect(join(root, 'dist')); checks++;
  assert.match(await readFile(join(root, 'dist/.assetsignore'), 'utf8'), /\*\*\/\*\.php/); checks++;
  console.log(`${checks} Cloudflare runtime and build checks passed. No email sent.`);
} finally {
  if (child.exitCode === null) {
    child.kill('SIGINT');
    await Promise.race([new Promise((resolve) => child.once('exit', resolve)), delay(5000)]);
    if (child.exitCode === null) child.kill('SIGTERM');
  }
  await rm(temp, { recursive: true, force: true });
}
