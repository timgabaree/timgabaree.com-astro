# Tim Gabaree — Astro

Professional website covering technology leadership, business results, governance, experience, and contact information.

Live site: [timgabaree.com](https://timgabaree.com/).

## How it is built

Astro generates static HTML and assets. A TypeScript Cloudflare Worker serves those assets and handles redirects, security headers, and protected staging. Small browser scripts provide interactive behavior; there is no PHP runtime in the deployed site.

Responsive portraits and QR contact links, résumé/contact downloads, an on-demand Calendly dialog, and HTML/XML sitemaps with an image gallery.

The toolchain uses Node.js (version pinned in `.nvmrc`), npm, TypeScript, and Wrangler. `package-lock.json` pins dependency versions.

## Project structure

- `src/pages/` — page content and routes.
- `src/layouts/`, `src/components/` — shared page shell, navigation, footer, and privacy controls.
- `src/data/page-meta.json` — page metadata.
- `public/` — styles, browser scripts, media, downloads, and the XML sitemap.
- `worker/` — request handling, contact validation, and persistent form-security state.
- `scripts/`, `tests/` — asset preparation and automated checks.

Add pages with the shared layout, update navigation and metadata, and keep the sitemap in sync. Responsive AVIF derivatives are generated from original images during development and builds. Legacy PHP files are reference material, not deployment assets.

## Local development

Install the Node version in `.nvmrc`, then run:

```sh
nvm use
npm ci
npm run dev
```

Astro's development server previews page content. To test Worker routing and form handling locally:

```sh
npm run build:staging
npm run preview
```

Use the local URL printed by each server. The command above uses no-email mode; a successful local form test does not send a message.

## Validation

```sh
npm run prepare:production
```

The preparation command runs type checks, tests, a production build, configuration checks, and a deployment dry run; it does not publish.

`npm run test:integration` checks the local Worker. `npm run test:live` checks the deployed site without submitting a contact message.

## Cloudflare deployment

Staging and production use separate Workers:

- `wrangler.jsonc` — staging configuration; assets built to `dist/`.
- `wrangler.production.jsonc` — production configuration; assets built to `dist-production/`.

Staging uses HTTP Basic authentication with `STAGING_USER` and `STAGING_PASSWORD` stored as Cloudflare secrets. It is excluded from indexing and does not load Google Analytics. After configuring credentials and infrastructure, `npm run deploy:staging` builds and publishes staging.

Production redirects HTTP and `www` to the HTTPS apex. Public production `workers.dev` and version-preview URLs are disabled. Apex and www use Cloudflare Custom Domains.

For an **existing, configured production Worker**, run validation, commit and push the source, then:

```sh
npx wrangler versions upload --config wrangler.production.jsonc
# Replace VERSION_ID with the version returned by the upload.
npx wrangler versions deploy VERSION_ID@100 --config wrangler.production.jsonc
```

Upload does not shift traffic; the deployment command does. Verify the published pages, redirects, assets, and privacy controls afterward. Git pushes do not deploy the website. Keep the previous version available for a reviewed rollback.

The optional [WebStorm workflow](WEBSITE-WORKFLOW/00-START-HERE.md) provides separate check, commit, push, upload, publish, and verification actions.

## Contact email

The Worker validates submissions, applies CSRF/replay and rate-limit protection, and sends through Resend. Cloudflare Durable Objects hold temporary form-security state. Configure `RESEND_API_KEY`, `CONTACT_FROM`, and `CONTACT_TO` as secrets in each environment.

Use separate sending-only keys scoped to a verified sender domain. Keep delivery encrypted and open/click tracking disabled. The recipient is server-controlled; visitor email is used only for Reply-To. Provider acceptance or a thank-you page does not prove inbox delivery. Use a controlled end-to-end test when validating email.

## Privacy and analytics

Google Analytics loads only after opt-in on production. Visitors can reopen privacy choices from the footer; dismissal is not consent. Cloudflare Web Analytics is configured separately at the edge; avoid adding a duplicate beacon. Contact message contents are not sent to analytics.

## Adapting this project

This is a site-specific implementation, not an account-neutral starter:

1. Replace content, branding, metadata, domain references, analytics identifiers, and privacy/contact details.
2. Set your own Cloudflare account, Worker names, hostnames, routes, and environment variables. Keep production closed until setup and checks are complete.
3. Provision the resources and bindings referenced by the Worker configurations in your own account, including Durable Objects and any cross-Worker dependencies. Configure secrets outside Git.
4. Update host-specific tests and verification scripts. The optional WebStorm helpers also enforce repository ownership, branch, and account identity; adapt both `WEBSITE-WORKFLOW/site.json` and the guards in `workflow.mjs` before reuse.
5. Establish staging, then production infrastructure and routing separately. The version-upload sequence above is for subsequent releases, not a complete first-time provisioning procedure.

Keep credentials, generated builds, archives, and local reports out of Git and public assets. Use only content and media you have permission to reuse. During a hosting migration, preserve unrelated sites and email DNS.

## Monitoring

Services: UptimeRobot and Cloudflare.
