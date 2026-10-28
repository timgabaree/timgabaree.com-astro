import { copyFileSync, readdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { transform } from 'lightningcss';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const output = fileURLToPath(new URL(process.env.PUBLIC_SITE_ENV === 'production'
  ? '../dist-production/' : '../dist/', import.meta.url));
// Astro recreates dist on every build. Remove Apache-only files from that output,
// not from the source or the separate PHP project.
function clean(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink in build: ${path}`);
    if (entry.isDirectory()) clean(path);
    else if (entry.name === '.htaccess') rmSync(path);
    else if (/\.php$/i.test(entry.name) || (entry.name.startsWith('.') && entry.name !== '.assetsignore')) {
      throw new Error(`Refusing to publish non-public source: ${path}`);
    }
  }
}
clean(output);
// Minify the published copy only; retain the readable stylesheet in public/.
const stylesheet = join(output, 'css/style.css');
writeFileSync(stylesheet, transform({ filename: 'style.css', code: readFileSync(stylesheet),
  minify: true, targets: { safari: 15 << 16, chrome: 100 << 16, firefox: 100 << 16 } }).code);
copyFileSync(new URL('../LICENSE', import.meta.url), join(output, 'LICENSE'));
console.log('Cloudflare assets verified: no PHP source or Apache configuration.');
