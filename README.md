# timgabaree.com Astro migration

The Astro site is separate from the live PHP repository and GoDaddy deployment.
Its new staging target is Cloudflare Workers. No production hostname is configured.

## Develop and test

Use the Node version in `.nvmrc` (`nvm use`), then:

```bash
npm ci
npm run dev
npm run check
npm test
npm run build
npm run test:integration
npm run preview
```

`npm run dev` previews pages on port 4321. `npm run preview` previews the complete
Cloudflare site and contact handler at http://127.0.0.1:8787. It binds only to the
local machine and always uses no-email test mode. A valid submission returns to
the contact page with an explicit test-success message, not a false delivery claim.

The integration suite starts its own isolated local Worker on port 8791, exercises
the actual Durable Object runtime, and removes only its temporary test state.
Unit tests cover validation, private staging, CSRF, replay, expiry, throttling,
honeypots, provider failures and one-time conversions. Provider calls are mocked;
passing tests do not prove actual email delivery.

## Cloudflare staging

Staging address: https://timgabaree-com-astro-staging.timgabaree-com-astro.workers.dev
The generated login is stored only in the ignored local `.dev.vars` file and as
Cloudflare secrets. `npm run test:staging` verifies this exact address using that
local file. With email enabled, it checks the site without submitting a message.
An approved real delivery test requires `npm run test:staging -- --send-email`.

`wrangler.jsonc` names only `timgabaree-com-astro-staging`. It uses a separate
Workers-provided address and has no production routes or custom domain. Every
request, including downloads and form endpoints, passes through the Worker.

- Remote staging fails closed (503) until `STAGING_USER` and `STAGING_PASSWORD`
  are set as Worker secrets. Use an ASCII username and a unique password of at
  least 20 characters. Visitors then see an HTTPS Basic Authentication prompt.
- All staging responses are private/no-store and carry `X-Robots-Tag: noindex`.
  Staging robots.txt disallows crawling. Builds default to noindex and omit both
  the analytics loader and the noscript analytics iframe.
- `CONTACT_MODE=dry-run` sends no email and saves no message body.
- Session tokens and conversion flags expire one hour after issuance; idle
  Durable Objects are automatically cleaned up. Rate counters expire after ten minutes (token issuance
  counters after one minute). No names, emails, messages or raw IPs are stored.
- The production PHP repository, GoDaddy files, website DNS and email DNS must
  remain untouched during staging setup.

After signing into the intended Cloudflare account with Wrangler:

```bash
npm run deploy:staging
npx wrangler secret put STAGING_USER
npx wrangler secret put STAGING_PASSWORD
```

The initial deployment remains locked until both secrets are configured. Do not
enable automatic deployments or attach the production domain as part of staging.
Confirm the account before deploying. `npx wrangler whoami` shows the account.
Verify HTTPS, authentication on every route, downloads, redirects, real 404s, the
contact test result and no-index responses on the actual online address.

## Staging email delivery

The staging Worker uses Resend with the verified sending domain
`forms.timgabaree.com`, sender `website@forms.timgabaree.com`, and fixed recipient
`tim@timgabaree.com`. Its API key is sending-only and restricted to that domain,
stored only as a Cloudflare Worker secret. Resend requires TLS delivery; email
to a server without TLS fails rather than being sent unencrypted. Local previews
and automated local tests still use no-email mode. Open/click tracking is not configured.

The optional delivery adapter uses [Resend](https://resend.com/docs/api-reference/emails/send-email).
Before enabling it, approve the service/account and verify a separate sending
subdomain using its exact DNS instructions. Do not replace the existing mailbox
MX records or overwrite existing SPF/DKIM/DMARC records. Keep open/click tracking
disabled for contact messages. Confirm recipient, sender and privacy text first.

Set `RESEND_API_KEY`, `CONTACT_FROM` and `CONTACT_TO` as Cloudflare secrets, then
explicitly change `CONTACT_MODE` to `resend` and redeploy. The recipient is fixed
server-side; visitor email is only Reply-To. Staging subjects get a `[STAGING]`
prefix. A successful API response records a one-time conversion, but inbox receipt
still needs a real test. Provider failures do not report successful delivery.
Test mode never falls through to the provider, even if credentials are present.

Credentials must never go in Git, frontend variables, or chat. `.dev.vars` is
ignored; `.dev.vars.example` lists the optional local secret names. No secrets are
needed for the default local no-email preview.

## Build and deployment safety

`npm run build` creates static pages in `dist/`, strips Apache configuration from
that generated output, and refuses PHP or unexpected hidden files. `.assetsignore`
also excludes backend files from uploads as defense in depth. Worker code replaces
the former Apache redirects, security headers and PHP form handlers.

The previous `server-php/`, Apache source files and legacy helper scripts remain
in Git as migration references. They are **not** part of the Cloudflare deployment.
`npm run build:legacy-php` and `npm run preview:legacy-php` are retained only for
local PHP comparison. Always rebuild with `npm run build` before Cloudflare use.
Never serve a legacy build through a generic static server: it contains PHP source.

## Before production cutover

Production is a separate, explicitly approved task. Configure its own Worker and
state, approved mail service and secrets, canonical redirects and DNS plan. Update
the privacy disclosures for the actual providers and retention. Build with
`PUBLIC_SITE_ENV=production` only for production, then verify analytics, SEO,
contact delivery and rollback before changing the live website DNS. Do not remove
GoDaddy or alter mailbox DNS during staging work.

## Project structure

- `src/` — Astro pages, metadata and shared layout/components
- `public/` — site assets and downloads
- `worker/` — Cloudflare routing, staging authentication, contact form and state
- `scripts/prepare-cloudflare.mjs` — safe static build preparation
- `tests/`, `scripts/test-cloudflare.mjs` — unit and local runtime tests
- `server-php/` — retained legacy reference; never uploaded to Cloudflare
