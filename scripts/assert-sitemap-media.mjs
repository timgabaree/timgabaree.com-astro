import assert from 'node:assert/strict';

// Shared local/live regression check: retain every image and its page association.
export function assertSitemapMedia(xml, html) {
  let checks = 0;
  const groups = new Map(Array.from(html.matchAll(/<section\b[^>]*data-sitemap-page="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g),
    ([, page, content]) => [page, content]));
  let expectedTotal = 0;
  for (const [, entry] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const page = new URL(entry.match(/<loc>([^<]+)<\/loc>/)[1]).pathname;
    const images = Array.from(entry.matchAll(/<image:loc>([^<]+)<\/image:loc>/g), ([, source]) => new URL(source).pathname);
    if (!images.length) continue;
    expectedTotal += images.length;
    const group = groups.get(page);
    assert.ok(group, `${page}: image gallery exists`); checks++;
    assert.equal(Array.from(group.matchAll(/<img\b/g)).length, images.length, `${page}: every image rendered`); checks++;
    for (const image of images) {
      assert.ok(group.includes(`src="${image}"`), `${page}: thumbnail ${image}`); checks++;
      assert.ok(group.includes(`href="${image}"`), `${page}: full-size link ${image}`); checks++;
    }
  }
  assert.ok(expectedTotal > 0, 'sitemap contains indexed images'); checks++;
  return checks;
}
