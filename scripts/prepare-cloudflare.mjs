import { copyFileSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const output = fileURLToPath(new URL('../dist/', import.meta.url));
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
copyFileSync(new URL('../LICENSE', import.meta.url), join(output, 'LICENSE'));
console.log('Cloudflare assets verified: no PHP source or Apache configuration.');
