import { cpSync, copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');
const sourceDirectory = resolve(projectDirectory, 'server-php');
const outputDirectory = resolve(projectDirectory, 'dist');

mkdirSync(outputDirectory, { recursive: true });
copyFileSync(
  resolve(projectDirectory, 'LICENSE'),
  resolve(outputDirectory, 'LICENSE'),
);
cpSync(
  resolve(sourceDirectory, 'includes'),
  resolve(outputDirectory, 'includes'),
  {
    recursive: true,
    filter: (path) => !/(?:^|\/)(?:_notes|\.DS_Store|error_log)(?:\/|$)/.test(path),
  },
);
copyFileSync(
  resolve(sourceDirectory, 'contact-submit.php'),
  resolve(outputDirectory, 'contact-submit.php'),
);
copyFileSync(
  resolve(sourceDirectory, 'contact-token.php'),
  resolve(outputDirectory, 'contact-token.php'),
);
copyFileSync(
  resolve(sourceDirectory, 'contact-conversion.php'),
  resolve(outputDirectory, 'contact-conversion.php'),
);
copyFileSync(
  resolve(projectDirectory, 'public', '.htaccess'),
  resolve(outputDirectory, '.htaccess'),
);

console.log('Copied the protected PHP contact backend into dist.');
