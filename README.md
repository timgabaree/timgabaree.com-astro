# timgabaree.com Astro migration

The Astro site is separate from the live PHP repository and GoDaddy deployment.
Its new staging target is Cloudflare Workers. No production hostname is configured.
GoDaddy Web Hosting Deluxe is shared: `rgesol.com` is the primary domain, and
`timgabaree.com` and the other sites are hosted beneath that account. Moving this
site must not change or cancel the shared account or affect its other domains.

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
  Staging robots.txt disallows crawling. Builds default to noindex. Privacy-choice
  controls are available for phone testing, with a visible preview notice and a
  build-time gate that blocks Google analytics even after acceptance. No build
  includes a noscript analytics iframe or Google preconnect.
- `CONTACT_MODE=dry-run` sends no email and saves no message body.
- Session tokens and conversion flags expire one hour after issuance; idle
  Durable Objects are automatically cleaned up. Rate counters expire after ten minutes (token issuance
  counters after one minute). No names, emails, messages or raw IPs are stored.
- The production PHP repository, GoDaddy files, website DNS and existing mailbox
  DNS must remain untouched during staging setup. Resend uses separate sending
  records under `forms.timgabaree.com`.

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
Staging delivery was confirmed by Resend and by the recipient on October 27, 2026.

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

## Production preparation (not a cutover)

`wrangler.production.jsonc` targets the separate `timgabaree-com-astro-production`
Worker in the intended Cloudflare account. Its Durable Objects belong to that
Worker, not staging. Production builds go to `dist-production/`; staging builds
remain in `dist/`. Neither generated folder belongs in Git.

The still-closed production Worker was refreshed on October 27, 2026 (America/Chicago;
October 28 UTC) from source commit `61b293763f2be27fe8ed6562556f8b92b504e397`.
Its current deployed version is `9e9c8588-a358-407a-8ae2-58e921f0a0db`, replacing
`4019fbda-492d-4105-80cf-97ed2231832d`. It includes the analytics opt-in, privacy
disclosures, and accessible Calendly dialog. Cloudflare reported **no deployed
targets**. Remote version metadata confirms `PRODUCTION_ENABLED=false`, no preview,
and all assets passing through the Worker. `workers.dev` and preview URLs remain
disabled, and the configuration's route list remains empty.

Production secrets `RESEND_API_KEY`, `CONTACT_FROM`, and `CONTACT_TO` remain
installed; no secret values are recorded here. Production keeps its original,
separate Durable Object namespace. This was not a live launch: no DNS, domain
bindings, GoDaddy files, or shared-hosting settings were changed. Staging remains
on version `08cef3a3-99e6-46ae-9b82-888860bf318d` and was not redeployed.

Verification for this refresh: Astro/TypeScript had zero errors, warnings or hints;
30 unit tests, 177 production build/configuration checks, 80 local Worker runtime
checks, and 73 online staging checks passed. The production build and deployment
dry run also passed before upload. No email was submitted. These checks establish
build/configuration safety; actual-domain behavior still requires cutover testing.

```bash
npm run prepare:production
```

This runs type checks, unit tests, a production build, local production
configuration/content checks, and a Wrangler **dry run**. It does not deploy,
send email, touch GoDaddy, or change DNS. The preparation checks deliberately
require an empty route list, disabled `workers.dev` and preview URLs, and
`PRODUCTION_ENABLED=false`. Revise those assertions as part of an approved launch,
not to make a preparation check pass by exposing the site.

The production Worker returns 503/no-store/noindex until the explicit launch
switch is `true` and all three email secrets exist with `CONTACT_MODE=resend`.
Once enabled, only `timgabaree.com` and `www.timgabaree.com` are accepted. HTTP and
www requests redirect to `https://timgabaree.com`, preserving paths, query strings
and POST methods. Both hostnames still need Cloudflare routing at cutover; code
alone does not bind DNS or issue certificates. Unknown hosts are rejected.

Production has its own sending-only Resend key restricted to
`forms.timgabaree.com`, plus `CONTACT_FROM` and `CONTACT_TO` secrets on the production
Worker. Do not copy staging credentials or put keys in this configuration.
Retain enforced TLS and disabled email tracking. No production secrets are
required for the local checks, which mock the mail provider and never send email.
The earlier approved private production email test was delivered and confirmed
by the recipient on October 27. That tested the adapter and credentials, not the
final public-domain form path. No repeat email was sent during this refresh.

Logs/traces remain disabled to avoid collecting request data inadvertently.
Before launch, choose privacy-conscious uptime/error monitoring, check account
usage limits and email quotas, and decide who receives failure notifications.
GitHub holds the source; pushes do not automatically deploy either environment.

### Completed review and remaining launch gates

Analytics now uses a local opt-in gate: no Google preconnect, iframe or tag load
before acceptance. Production builds show equally prominent accept/decline
controls and a footer “Privacy choices” button. Preferences expire after 180 days;
restricted storage fails closed. Withdrawal removes known first-party Google
measurement cookies and reloads to unload tags. Advertising consent stays denied.
The hostname guard also prevents analytics on local and staging previews, even
when previewing a production build. A separate build-time flag blocks tracking
in staging builds regardless of hostname. Staging displays the same choice
controls for testing, without Google requests. Custom events are not queued before consent.

Calendly now opens a native dialog containing a titled iframe, with real Close
buttons before and after the calendar, focus restoration and a direct-link
fallback. Escape works from the parent dialog; keys inside Calendly's cross-origin
frame are controlled by Calendly. Tab/Shift+Tab provides an exit to our controls.
No Calendly resource is requested until the visitor activates Schedule.

The shared GTM container has not been changed. At cutover, verify analytics
requests/cookies on the actual domain for accept, decline and withdrawal. The
last published container review found no `contact_form_submission` event tag;
configure that separately if contact-conversion reporting is wanted. Do not
publish shared-container changes casually: the live PHP site also uses it.

Completed: the user confirmed the staging privacy choices and Calendly work in
their desktop browser. Keyboard navigation, close controls and focus restoration
were verified locally. Download/external-link review was completed earlier.
The user explicitly deferred further phone testing; do not describe it as passed.
Chrome's mobile preview had stalled on the embedded Calendly request, while the
in-app browser loaded it. The full-page Calendly link remains available.

Minimum TLS was raised to 1.2 in the earlier approved security change; TLS 1.3
remains enabled. During this refresh, the live apex returned 200 using TLS 1.2
and rejected TLS 1.1 with a server protocol-version alert. No TLS setting was
changed during this refresh.

Still required before/at an explicitly approved cutover:

- Freeze PHP edits/deployments; check for changes since the archive and refresh
  the archive if necessary. Refresh the exact apex/www DNS and routing snapshot.
- Agree the cutover window, failure-alert recipient and monitoring approach;
  check Cloudflare limits and Resend quotas. No recurring monitoring is enabled.
- Prepare launch configuration and tests intentionally: enable production only
  after approval, retain disabled workers.dev/preview URLs, and attach only
  apex/www as Custom Domains. The existing www CNAME must be replaced at cutover.
  Do not enable the public hostnames while the production launch gate is false.
- Verify certificates, HTTPS/HTTP and www redirects, legacy URLs, downloads,
  security headers, missing-page responses, indexing, sitemap, canonical URLs,
  and analytics accept/decline/withdrawal on the actual domain after switching.
  Staging must remain private, unindexed, and unable to send Google analytics.
- With separate approval, submit one real-domain contact test and confirm inbox
  receipt. Failed sends must not claim success. The private email test is not a
  substitute for this final public-domain check.
- Record deployed version and final website routing; arrange agreed follow-up
  checks. Privacy disclosures describe implementation, not a legal compliance audit.

### GoDaddy archive and rollback boundary

The deployed GoDaddy addon-domain root was verified and archived on October 27,
not inferred from the local Git checkout. The archive is stored outside Git and
Dropbox at `/Volumes/StudioStack NVMe/Website Archives/timgabaree.com/2026-10-27-pre-cutover/`.
The tarball `godaddy-timgabaree.com.tar.gz` contains 144 regular files (166 total
entries), including hidden configuration and downloads; sibling sites are excluded.
Its SHA-256 is `b918d619387ad48ef8ff14931da0ebeea1827a065f891cf2cdc9be3342753886`,
rechecked successfully during this production refresh.

An independent extraction matched the recorded remote before/after file hashes.
No live restoration or complete Apache runtime restoration was performed. No
site-specific database dependency or active hosting-user cron entry was identified.
The archive excludes account-wide services, mailboxes and TLS private keys; it is
access-restricted but not independently encrypted. Make a second protected copy
before any eventual removal of the GoDaddy source, which is not authorized here.
The original archive report is historical: its TLS 1.0 note and older test counts
predate the later TLS hardening and this production refresh.

Saved website rollback values (refresh immediately before cutover): apex A
`72.167.204.130`, www CNAME `timgabaree.com`, both proxied with TTL Auto. Do not
blindly import the full DNS export or overwrite unrelated changes.

Capture exact current apex/www DNS records, proxy settings and redirect/Worker
rules; record how to restore the GoDaddy origin. After approval, attach only the
website hostnames to the new Worker and verify TLS, redirects, real 404s, contact
delivery and indexing. Leave MX, mailbox authentication records, Resend sending
records and every other hosted domain unchanged.

If critical checks fail, remove/disable the new website bindings and restore the
saved website DNS/routing settings, then verify the PHP site. Keep the deployed
GoDaddy files and domain mapping intact for rollback and archive. Do not delete
the addon domain, its folder, the `rgesol.com` primary site, or the shared Web
Hosting Deluxe account. Changing website DNS later does not require removing
those files or cancelling hosting.
Restore website traffic to GoDaddy before re-locking Astro: disabling Astro alone
while its domain bindings remain active would return 503 instead of restoring PHP.

## Project structure

- `src/` — Astro pages, metadata and shared layout/components
- `public/` — site assets and downloads
- `worker/` — Cloudflare routing, staging authentication, contact form and state
- `scripts/prepare-cloudflare.mjs` — safe static build preparation
- `tests/`, `scripts/test-cloudflare.mjs` — unit and local runtime tests
- `server-php/` — retained legacy reference; never uploaded to Cloudflare
