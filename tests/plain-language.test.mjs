import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = name => readFile(new URL(`../src/pages/${name}.astro`, import.meta.url), 'utf8');

test('homepage leads with practical leadership and preserves financial qualifiers', async () => {
  const home = await source('index');
  assert.match(home, /Bringing people, technology, and business priorities together\./);
  assert.match(home, /Identified \$25 million in projected savings/);
  assert.match(home, /Identified \$1\.5 million in duplicate vendor spend/);
  assert.match(home, /Résumé &amp; Executive Documents/);
  assert.match(home, /Let’s Talk/);
});

test('leadership pages retain qualified results and their existing canonical URLs', async () => {
  for (const name of ['technology-leadership', 'value-creation', 'governance']) {
    const page = await source(name);
    assert.ok(page.includes(`canonicalPath="/${name}"`));
    assert.match(page, /\$25M in projected\s+three-year savings/);
  }
  const value = await source('value-creation');
  assert.match(value, /Business Results from Technology/);
  assert.match(value, /Identified \$1\.5M in duplicate vendor spend/);
  assert.match(value, /When Modernization Is Worth the Cost/);
});

test('search descriptions and structured page descriptions agree', async () => {
  const metadata = JSON.parse(await readFile(new URL('../src/data/page-meta.json', import.meta.url), 'utf8'));
  for (const name of ['index', 'technology-leadership', 'value-creation', 'governance', 'about', 'contact']) {
    const page = await source(name);
    const description = page.match(/\n  description="([^"]+)"/)[1];
    const structured = JSON.parse(page.match(/const structuredData = (.+);/)[1]);
    const item = structured['@graph'].find(item => ['WebPage', 'ProfilePage', 'ContactPage'].includes(item['@type']));
    assert.equal(item.description, description);
    const meta = metadata[name === 'index' ? 'home' : name];
    assert.equal(meta.ogDescription, description);
    assert.equal(meta.twitterDescription, description);
  }
});
