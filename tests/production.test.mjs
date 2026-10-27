import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.ts';
import { sendMail } from '../worker/contact.ts';

function environment(overrides = {}) {
  return {
    ENVIRONMENT: 'production', PRODUCTION_ENABLED: 'true', CONTACT_MODE: 'resend',
    RESEND_API_KEY: 'synthetic-test-key', CONTACT_FROM: 'website@forms.timgabaree.com',
    CONTACT_TO: 'tim@timgabaree.com',
    ASSETS: { fetch: async () => new Response('<h1>Page</h1>', { headers: { 'Content-Type': 'text/html' } }) },
    CONTACT_STATE: { idFromName() { throw new Error('Unexpected form state access'); } },
    ...overrides,
  };
}

test('production preparation is locked, including pages, assets and contact endpoints', async () => {
  for (const override of [{ PRODUCTION_ENABLED: undefined }, { PRODUCTION_ENABLED: 'false' },
    { PRODUCTION_ENABLED: 'TRUE' }, { RESEND_API_KEY: undefined }, { CONTACT_FROM: '' },
    { CONTACT_TO: '' }, { CONTACT_MODE: 'dry-run' }]) {
    for (const path of ['/', '/robots.txt', '/css/style.css', '/contact-token', '/contact-submit']) {
      const response = await worker.fetch(new Request(`https://timgabaree.com${path}`), environment(override));
      assert.equal(response.status, 503);
      assert.match(response.headers.get('X-Robots-Tag'), /noindex/);
      assert.match(response.headers.get('Cache-Control'), /no-store/);
    }
  }
});

test('production redirects HTTP and www, retaining path, query and POST semantics', async () => {
  for (const origin of ['http://timgabaree.com', 'http://www.timgabaree.com', 'https://www.timgabaree.com']) {
    for (const method of ['GET', 'HEAD', 'POST']) {
      const response = await worker.fetch(new Request(`${origin}/contact?topic=board%20advisory&x=1`, { method }), environment());
      assert.equal(response.status, 308);
      assert.equal(response.headers.get('Location'), 'https://timgabaree.com/contact?topic=board%20advisory&x=1');
    }
  }
  const response = await worker.fetch(new Request('https://www.timgabaree.com//outside.invalid/path'), environment());
  assert.equal(new URL(response.headers.get('Location')).origin, 'https://timgabaree.com');
});

test('production rejects alternate hosts and ignores forwarded-host spoofing', async () => {
  for (const host of ['preview.example.invalid', 'timgabaree-com-astro-production.workers.dev', 'timgabaree.com.attacker.invalid']) {
    const response = await worker.fetch(new Request(`https://${host}/`, { headers: { 'X-Forwarded-Host': 'timgabaree.com' } }), environment());
    assert.equal(response.status, 404);
    assert.match(response.headers.get('X-Robots-Tag'), /noindex/);
  }
  const response = await worker.fetch(new Request('https://timgabaree.com/', { headers: { 'X-Forwarded-Host': 'attacker.invalid' } }), environment());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Location'), null);
  assert.equal(response.headers.get('WWW-Authenticate'), null);
  assert.equal(response.headers.get('X-Robots-Tag'), null);
  assert.equal(response.headers.get('Cache-Control'), 'no-cache');
  assert.match(response.headers.get('Strict-Transport-Security'), /max-age=/);
});

test('production retains legacy links and protects error and thank-you responses', async () => {
  for (const [path, target] of [['/index.php?x=1', '/?x=1'], ['/about.php?x=1', '/about?x=1'],
    ['/contact.html', '/contact'], ['/privacy/', '/privacy']]) {
    const response = await worker.fetch(new Request(`https://timgabaree.com${path}`), environment());
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('Location'), target);
  }
  for (const path of ['/thank-you', '/.env', '/includes/config.php', '/worker/index.ts']) {
    const response = await worker.fetch(new Request(`https://timgabaree.com${path}`), environment());
    assert.equal(response.status, path === '/thank-you' ? 200 : 404);
    assert.match(response.headers.get('X-Robots-Tag'), /noindex/);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
  const failure = await worker.fetch(new Request('https://timgabaree.com/'), environment({ ASSETS: { fetch() { throw new Error('Synthetic outage'); } } }));
  assert.equal(failure.status, 503);
  assert.equal(failure.headers.get('Cache-Control'), 'no-store');
});

test('production email uses the fixed recipient and has no staging subject prefix', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    const payload = JSON.parse(options.body);
    assert.equal(payload.subject, 'Website inquiry: Other');
    assert.deepEqual(payload.to, ['tim@timgabaree.com']);
    assert.equal(payload.reply_to, 'synthetic@example.invalid');
    assert.equal(payload.from, 'website@forms.timgabaree.com');
    assert.equal(payload.html, undefined);
    return Response.json({ id: 'synthetic-only' });
  });
  assert.equal(await sendMail({ name: 'Test', email: 'synthetic@example.invalid', topic: 'other',
    message: 'Synthetic only', csrf_token: 'a'.repeat(64) }, environment()), true);
});
