# timgabaree.com Astro migration

This project is the Astro replacement for the existing PHP presentation layer at
`timgabaree.com`. The original PHP repository remains separate and is the source
used for migration verification.

## Local development

Use the Node version recorded in `.nvmrc`:

```bash
nvm use
npm install
npm run dev
```

Astro development runs at `http://localhost:4321` by default.

## Production build

```bash
npm run build
```

Run `npm run check` before committing to check Astro and TypeScript diagnostics.

The build creates `dist/` with the static Astro site and the protected PHP files
needed by the contact form. The production web server must support PHP sessions,
PHP `mail()`, and Apache `.htaccess` rules.

The PHP contact backend is kept in `server-php/`. It is not exposed by Astro's
development server. `scripts/copy-php-endpoint.mjs` adds only that backend to the
production build after Astro finishes.

To review the complete build, including contact-form security and validation:

```bash
npm run build
npm run preview
```

Open `http://127.0.0.1:8765`. This preview runs PHP and deliberately disables
mail delivery. A valid form reaches the mail-failure message; it does not send
email. Astro's development server at port 4321 previews the pages only.
Do not serve `dist/` with a generic static server or `astro preview`: the build
contains PHP source that requires a PHP-capable server. The supplied preview
router blocks access to backend internals.

The Apache configuration preserves extensionless URLs, redirects legacy public
`.php` and `.html` links, returns a real 404 for missing pages, and blocks
backend files. CSS and JavaScript are revalidated so edits do not remain
hidden behind the old year-long cache policy. Page metadata is maintained in
`src/data/page-meta.json`; the thank-you page is excluded from indexing.

Before production cutover, verify mail delivery, sessions, TLS, and host-specific
Apache/PHP configuration on staging. Preview validation does not prove delivery.

## Project structure

- `src/layouts/BaseLayout.astro` — shared document metadata and page shell
- `src/components/Navigation.astro` — shared navigation
- `src/components/Footer.astro` — shared footer
- `src/pages/` — migrated public pages
- `public/` — styles, scripts, fonts, images, sitemap, and public downloads
- `server-php/` — contact-form security, validation, rate limiting, and mail

## Deployment boundary

Do not copy this project over the live PHP site manually. The existing workflow
uses GitHub as source of truth and an intentional server-side deployment. The
Astro deployment process should be tested in a staging or alternate document
root before the production site is switched to the contents of `dist/`.
