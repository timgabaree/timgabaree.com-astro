import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Display derivatives only. Originals remain unchanged for fallback, sitemap,
// social sharing and future re-encoding. Generate before both dev and builds.
const media = new URL('../public/media/', import.meta.url);
const output = new URL('optimized/', media);
await mkdir(output, { recursive: true });
const images = [
  ['background-pic-architecture-1920x942.webp', 'architecture-1920.avif', 1920, 35],
  ...[360, 600, 900].map(width => ['profile-pic-tim-gabaree-900x1200.webp', `portrait-${width}.avif`, width, 50]),
];
for (const [source, name, width, quality] of images) {
  const result = await sharp(fileURLToPath(new URL(source, media)))
    .resize({ width, withoutEnlargement: true })
    .avif({ quality, effort: 6, chromaSubsampling: '4:2:0' })
    .toFile(fileURLToPath(new URL(name, output)));
  console.log(`${name}: ${result.width}x${result.height}, ${result.size} bytes`);
}
