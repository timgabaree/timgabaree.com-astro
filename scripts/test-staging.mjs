import assert from 'node:assert/strict';

// Deliberately restricted to this isolated staging Worker, never the live site.
const base = 'https://timgabaree-com-astro-staging.timgabaree-com-astro.workers.dev';
process.loadEnvFile(new URL('../.dev.vars', import.meta.url));
const user = process.env.STAGING_USER;
const password = process.env.STAGING_PASSWORD;
assert.ok(user && password, 'Local staging credentials are required');
const authorization = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
let checks = 0;
const check = (actual, expected, label) => { assert.equal(actual, expected, label); checks++; };
const request = (path, init = {}, authenticated = true) => fetch(base + path, {
  ...init, redirect: 'manual', signal: AbortSignal.timeout(20_000),
  headers: { ...(authenticated ? { Authorization: authorization } : {}), ...init.headers },
});

for (const path of ['/', '/contact', '/css/style.css', '/armypubs/AH104(W).pdf', '/contact-token']) {
  const response = await request(path, {}, false);
  check(response.status, 401, `private ${path}`);
  assert.match(response.headers.get('X-Robots-Tag'), /noindex/); checks++;
  await response.body?.cancel();
}
for (const path of ['/', '/about', '/contact', '/governance', '/privacy', '/technology-leadership', '/value-creation', '/thank-you']) {
  const response = await request(path);
  check(response.status, 200, `authenticated ${path}`);
  assert.match(response.headers.get('Cache-Control'), /private, no-store/); checks++;
  const html = await response.text();
  assert.ok(!html.includes('googletagmanager.com/ns.html'), 'Staging analytics iframe must be absent'); checks++;
}
for (const path of ['/does-not-exist', '/includes/config.php', '/.env', '/css/.htaccess']) {
  const response = await request(path);
  check(response.status, 404, path);
  await response.body?.cancel();
}
const legacy = await request('/about.php?test=1');
check(legacy.status, 301, 'legacy redirect');
check(legacy.headers.get('Location'), '/about?test=1', 'query retained');
const download = await request('/armypubs/cmhPub_70-128.pdf', { method: 'HEAD' });
check(download.status, 200, 'PDF download');
assert.match(download.headers.get('Content-Type'), /application\/pdf/); checks++;
assert.match(await (await request('/robots.txt')).text(), /Disallow: \//); checks++;

const tokenResponse = await request('/contact-token');
check(tokenResponse.status, 200, 'online form initialization');
const token = await tokenResponse.json();
check(typeof token.test_mode, 'boolean', 'explicit email mode');
assert.match(tokenResponse.headers.get('Set-Cookie'), /; Secure/); checks++;
assert.match(tokenResponse.headers.get('Set-Cookie'), /HttpOnly/); checks++;
// Real email requires an explicit opt-in. Routine checks never send it.
const sendEmail = process.argv.includes('--send-email');
if (sendEmail) check(token.test_mode, false, 'real email mode required');
if (!token.test_mode && !sendEmail) {
  console.log(`${checks} online staging checks passed. Email is enabled; no message submitted. Use --send-email only with approval.`);
  process.exit(0);
}
const cookie = tokenResponse.headers.get('Set-Cookie').split(';')[0];
const testId = new Date().toISOString();
const response = await request('/contact-submit', {
  method: 'POST',
  headers: { Origin: base, Cookie: cookie, 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    name: 'Cloudflare Staging Test',
    email: sendEmail ? 'tim@timgabaree.com' : 'preview@example.invalid', topic: 'other',
    message: sendEmail
      ? `Approved staging email delivery test (${testId}). Sent through the Astro contact form on Cloudflare using Resend. The live PHP site is unchanged. No action is required.`
      : 'Synthetic no-email staging validation.',
    website: '', csrf_token: token.csrf_token,
  }),
});
check(response.status, 303, 'online form submission');
check(response.headers.get('Location'), sendEmail ? '/thank-you' : '/contact?status=test-success', 'expected submission response');
const conversion = await request('/contact-conversion?submitted=1', {
  method: 'POST', headers: { Origin: base, Cookie: cookie },
});
check((await conversion.json()).converted, sendEmail, 'conversion only for provider-accepted email');
console.log(`${checks} online staging checks passed. ${sendEmail ? `One email accepted by the provider (${testId}); verify delivery in Resend.` : 'No email sent.'} HTTPS certificate validation enabled.`);
