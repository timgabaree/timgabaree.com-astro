import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const text = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');

test('llms.txt is concise, structured, and site-specific', () => {
  assert.match(text, /^# Tim Gabaree\n/);
  assert.match(text, /^> .+/m);
  assert.match(text, /^## Executive leadership$/m);
  assert.match(text, /\[Technology leadership\]\(https:\/\/timgabaree\.com\/technology-leadership\)/);
  assert.match(text, /projected or identified savings as realized savings/);
  assert.doesNotMatch(text, /ai-train\s*=\s*yes/i);
  assert.ok(text.length < 6000);
});
