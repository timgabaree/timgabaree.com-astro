import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://timgabaree.com',
  trailingSlash: 'never',
  build: { format: 'file' },
});
