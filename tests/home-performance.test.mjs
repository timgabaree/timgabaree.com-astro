import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
for (const page of ['index', 'about']) {
  test(`${page} QR image and caption share one named contact link`, async () => {
    const html = await source(`src/pages/${page}.astro`);
    const block = html.match(/<div class="qr-code-block">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(block);
    assert.equal((block.match(/<a\s/g) ?? []).length, 1);
    assert.match(block, /<a class="qr-code-stack qr-code-caption-link"\s+href="\/contact"/);
    assert.match(block, /aria-label="Open Tim Gabaree’s contact page"/);
    assert.match(block, /<img[^>]+width="500" height="500"/);
    assert.match(block, /<span class="qr-code-caption">\s*Scan or click to connect\s*<\/span>\s*<\/a>/);
  });
}
test('homepage has responsive portrait and original image fallbacks with matching typed preload', async () => {
  const html = await source('src/pages/index.astro');
  assert.match(html, /preloadImage="\/media\/optimized\/architecture-1920.avif"\s+preloadImageType="image\/avif"/);
  assert.match(html, /srcset="\/media\/optimized\/architecture-1920.avif" type="image\/avif"/);
  for (const width of [360, 600, 900]) assert.ok(html.includes(`portrait-${width}.avif ${width}w`));
  assert.match(html, /src="\/media\/background-pic-architecture-1920x942.webp"/);
  assert.match(html, /src="\/media\/profile-pic-tim-gabaree-900x1200.webp"/);
  assert.match(html, /class="home-intro-profile-picture-img home-intro-profile-picture-img-hover" loading="lazy" fetchpriority="low"/);
});
test('entrance animations retain timing but do not compete over opacity', async () => {
  const css = await source('public/css/style.css');
  for (const direction of ['up', 'right']) {
    const animation = css.match(new RegExp(`@keyframes home-intro-slide-in-${direction} \\{([\\s\\S]*?)(?=\\n@keyframes)`))?.[1];
    assert.ok(animation);
    assert.doesNotMatch(animation, /opacity/);
    assert.match(animation, /transform/);
  }
  assert.match(css, /home-intro-slide-in-up 1.5s ease-in-out forwards, home-intro-fade-in 2s ease-in-out forwards/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
