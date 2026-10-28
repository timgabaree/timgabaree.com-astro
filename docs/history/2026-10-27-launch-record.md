# Archived launch and hardening record — October 27, 2026

Historical snapshot: the former README is preserved below without changing its
recorded evidence. It contains superseded deployment states, diagnostic steps,
test counts and instructions. **Do not use this archive as the current runbook.**
Use the [project overview](../../README.md) and [operations guide](../OPERATIONS.md).
Dates and words such as "current" below refer to the original October 27 record,
not the date this file is read. Later sections can supersede earlier ones.

---

# timgabaree.com Astro migration

The Astro site is live on Cloudflare Workers at https://timgabaree.com, with
https://www.timgabaree.com redirecting to the apex. Its repository remains separate
from the PHP repository. GoDaddy files are retained unchanged for archive/rollback;
website traffic no longer uses that origin. Staging remains private.
GoDaddy Web Hosting Deluxe is shared: `rgesol.com` is the primary domain, and
`timgabaree.com` and the other sites are hosted beneath that account. Moving this
site must not change or cancel the shared account or affect its other domains.

## Current release status — October 27, 2026

This release records the deployed monitoring hardening, homepage/About QR
accessibility fix, mobile image/rendering optimization, and updated operating
notes. Older verification records below are historical snapshots, not current
deployment instructions or unresolved launch gates.

| Environment | Deployed version | Status |
| --- | --- | --- |
| Production | `d59fcf0b-ae40-4d91-88af-b8dec825bef6` | Live; includes monitoring, QR, performance and privacy-spacing fixes |
| Staging | `e178c625-fbbd-4f71-bed7-a79948acbdff` | Private; monitoring hardening deployed; latest QR/performance changes built/tested locally only |
| Email monitor | `6686f411-a606-4bd3-b265-be12cfc1dfbf` | Retries and persistent fallback deployed; automatic alert received and recovery verified |

- The older Cloudflare SQL email-failure alert is disabled, not deleted.
  UptimeRobot is the verified primary alert path; Cloudflare logging and
  certificate alerts remain enabled. See the monitoring section for limits and
  safe incident acknowledgement.
- Latest homepage PageSpeed lab scores: mobile 96 performance / 100 accessibility;
  desktop 100 / 100. Both have 100 best practices and SEO. The linked reports and
  visual/keyboard verification are recorded below; these are not real-device or
  field-performance guarantees.
- Current checks: 59 unit tests, 22 monitoring runtime checks, 328 production
  build/configuration checks, 88 local site runtime checks, 298 read-only live
  checks, and 73 online staging checks. No new contact email is needed for this
  source-control release.
- GoDaddy/shared hosting, all email DNS, credentials and analytics-consent rules
  are unchanged. Generated builds, image derivatives, archives, local credentials
  and screenshots are not committed to this source repository.
- Remaining follow-up: user verification of Dropbox cloud synchronization,
  optional physical-phone testing, and normal indexing/analytics/monitoring
  review. Deploying the current source to staging is a separate action; a Git
  push does not publish either environment.

## Develop and test

### Compact cookie notice and XSLT-free sitemap (2026-10-27)

Both Google and Cloudflare analytics are retained. New visitors see a small,
non-modal bottom-corner cookie notice with equally styled Allow cookies and
Decline buttons. It never takes focus or blocks scrolling. Google Analytics
stays off until acceptance; advertising consent stays denied. The footer
“Privacy choices” control reopens settings. Close or Escape dismisses them
without granting consent; a session-storage flag suppresses repeated notices
in the same tab session. Existing unexpired accept/decline choices are respected.
Unavailable storage fails closed for Google Analytics.

The CSP now permits only Cloudflare's specific analytics script and collection
origins in addition to the existing allowed services. Cloudflare supplies the
beacon at the edge; there is no duplicate hard-coded beacon. Its cookie-free Web
Analytics is independent of the Google cookie choice. No person-identification,
IP-to-person lookup, or browser fingerprinting feature has been added.

The footer now links to a normal, responsive HTML sitemap at `/sitemap`, rendered
at build time from the same XML URL list. `/sitemap.xml` remains available to
search engines with its image entries, and robots.txt still points to it. The
XSL processing instruction and obsolete `sitemap.xsl` have been removed from the
Astro project (recoverable in Git history); the PHP sibling is unchanged.

Pre-publication checks passed: Astro/TypeScript (zero diagnostics), 50 unit tests,
243 production build/configuration checks, 88 isolated local runtime checks,
XML parsing, and desktop/390px-wide browser layout review. Dismissal survives
navigation/reload in the same tab without enabling Google. No actual phone test
is claimed. Google Tag Manager, DNS, secrets and GoDaddy resources are unchanged.
Published from commit `e428d8b` to production Worker version
`0853521d-4b90-48f5-8f7a-b8dd09627e24`. All 209 read-only live checks passed:
pages, redirects, security headers, sitemap, download hashes, private staging,
and email-monitor health/status. `/sitemap.xsl` now returns 404; XML contains no
stylesheet reference. No contact test or email was sent during this update.

Live Chrome verification: Google filter showed 0/29 requests with the existing
declined preference; the Cloudflare beacon loaded and `/cdn-cgi/rum` returned 204.
Allow cookies then loaded the intended GTM/GA4 tags and GA4 page_view returned 204
for `G-WV3F87ZRF2`. Subsequent withdrawal reloaded the page and returned to zero
Google requests. The original declined browser preference was restored.
This verifies request acceptance, not the latency of reporting dashboards.
The live sitemap/cookie controls rendered correctly; the in-app browser reported
no console warnings/errors on that page. GoDaddy, all DNS records, credentials,
the shared GTM container and Cloudflare analytics account settings were unchanged.

### Local commands

The HTML sitemap also renders every indexed image from `public/sitemap.xml`:
29 page-image entries (20 distinct files), grouped by their seven associated
pages. Thumbnails link to the original full-size images and load lazily. The
shared local/live regression check verifies every thumbnail, link and page
association so the media gallery cannot silently disappear in a future update.
This is build-time HTML, with no XSLT dependency or additional browser script.

Use the Node version in `.nvmrc` (`nvm use`), then:

```bash
npm ci
npm run dev
npm run check
npm test
npm run test:monitoring
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

## Production deployment

The explicitly approved cutover completed October 27, 2026 (America/Chicago;
October 28 UTC). The initial launch version was `51d4ce62-df27-462a-a4d8-48c9a2fbc58a`;
the current version is listed in Current release status above. Production serves
both `timgabaree.com` and `www.timgabaree.com` as Cloudflare Custom Domains.
`PRODUCTION_ENABLED=true`; workers.dev and preview URLs remain disabled. Staging
retains authentication and its separate credentials/state. Email secrets were
not changed during cutover. Source pushes do not automatically deploy.

Launch verification:

- 140 read-only live checks passed: pages, canonical URLs, HTTP/www and legacy
  redirects, security headers, real 404s, robots/sitemap, byte-identical PDF/vCard
  downloads, private staging, disabled production workers.dev and monitoring probes.
- TLS 1.2 succeeded; TLS 1.1 was rejected. No TLS settings changed at cutover.
- On the actual domain, Google tag scripts were absent before consent, appeared
  after acceptance, and were absent after withdrawal/reload. This DOM-level check
  is not an end-to-end analytics event/cookie audit. Calendly loaded; its keyboard
  Close control restored focus to Schedule and removed the iframe. No booking made.
- One approved live-form submission, **Cloudflare Live Cutover Test**, reached the
  thank-you page. Resend recorded Delivered at 20:27 local time, email ID
  `01a1801e-3f87-7b51-8c4b-649dc8ab7f80`, tagged production. Tim confirmed inbox
  receipt at `tim@timgabaree.com` in this launch review.
- All five UptimeRobot monitors reported Up after launch. Homepage certificate
  data is populated (Google Trust Services, expires December 1, 2026). The prior
  synthetic email-failure incident remains resolved; no new failure was injected.
- All 144 remote GoDaddy file hashes still match the archived manifest. Shared
  hosting, addon-domain mappings and other sites were untouched.
- All 23 non-website DNS records present when this turn resumed were preserved
  exactly, including mailbox/Resend records and a newly present Google verification
  TXT. The old apex A and www CNAME were already absent at resumption; this turn
  attached both Custom Domains without deleting any further DNS records.

Evidence and before/resume/after DNS snapshots are outside Git at
`/Volumes/StudioStack NVMe/Website Archives/timgabaree.com/2026-10-27-launch/`.
The configuration, launch-check script and these notes are included in the
approved launch commit. No credential values belong in these records.

```bash
npm run prepare:production
npm run test:live
```

Preparation now validates the approved live configuration: exactly these two
Custom Domains, production enabled, workers.dev/preview disabled. It builds and
performs a deployment dry run, but does not deploy or alter DNS. The live suite
only reads public endpoints; it does not send email. Historical preparation
results below describe the earlier closed deployment, not the current live state.

### Pre-cutover preparation record (historical)

`wrangler.production.jsonc` targets the separate `timgabaree-com-astro-production`
Worker in the intended Cloudflare account. Its contact-security Durable Objects
belong to that Worker, not staging. Only sanitized failure-status data is shared
with the separate monitoring Worker. Production builds go to `dist-production/`; staging builds
remain in `dist/`. Neither generated folder belongs in Git.

The still-closed production Worker was refreshed on October 27, 2026 (America/Chicago;
October 28 UTC) with the monitoring implementation included in this repository.
Its then-deployed version was `8349cf75-eed2-4ca0-8a92-8fbdb6f76c66`,
replacing `ef90c1c5-be10-4b09-979c-8b8a8c3d3cd8`. It includes persistent sanitized
email-failure status and updated monitoring privacy disclosures, alongside the analytics opt-in and
accessible Calendly dialog. Cloudflare reported **no deployed
targets**. Remote version metadata confirms `PRODUCTION_ENABLED=false`, no preview,
and all assets passing through the Worker. `workers.dev` and preview URLs remain
disabled, and the configuration's route list remains empty.

Production secrets `RESEND_API_KEY`, `CONTACT_FROM`, and `CONTACT_TO` remain
installed; no secret values are recorded here. Production keeps its original,
separate contact-security Durable Object namespace. This was not a live launch: no DNS, domain
bindings, GoDaddy files, or shared-hosting settings were changed. Staging was
refreshed to version `68af1c46-7070-4b91-8ee9-4f9a80337f9c` and retains Basic Auth.

Verification for this refresh: Astro/TypeScript had zero errors, warnings or hints;
46 unit tests, 180 production build/configuration checks, 80 local Worker runtime
checks, 12 real-runtime monitoring checks, and 73 online staging checks passed.
Both site builds and the separate monitoring deployment dry run passed before
upload. No contact email was submitted; the signed synthetic monitoring test is
described below. These checks establish
build/configuration safety; actual-domain behavior still requires cutover testing.

```bash
npm run prepare:production
```

This runs type checks, unit tests, a production build, local production
configuration/content checks, and a Wrangler **dry run**. It does not deploy,
send email, touch GoDaddy, or change DNS. Before launch, the checks required an
empty route list and `PRODUCTION_ENABLED=false`. Those assertions were deliberately
updated for the approved launch; current requirements are documented above.

The production Worker returns 503/no-store/noindex until the explicit launch
switch is `true` and all three email secrets exist with `CONTACT_MODE=resend`.
Once enabled, only `timgabaree.com` and `www.timgabaree.com` are accepted. HTTP and
www requests redirect to `https://timgabaree.com`, preserving paths, query strings
and POST methods. Both hostnames now have Cloudflare Custom Domain routing; code
alone does not bind DNS or issue certificates. Unknown hosts are rejected.

Production has its own sending-only Resend key restricted to
`forms.timgabaree.com`, plus `CONTACT_FROM` and `CONTACT_TO` secrets on the production
Worker. Do not copy staging credentials or put keys in this configuration.
Retain enforced TLS and disabled email tracking. No production secrets are
required for the local checks, which mock the mail provider and never send email.
The earlier approved private production email test was delivered and confirmed
by the recipient on October 27. That tested the adapter and credentials, not the
final public-domain form path. No repeat email was sent during this refresh.

Operational error logs are now enabled, with automatic invocation logs disabled.
The application emits only a fixed `TG_CONTACT_ALERT` marker, environment, and
failure code. It never logs form contents, email addresses, credentials, raw IPs,
or provider responses. Cloudflare may add its own operational metadata.
Check account usage limits and email quotas before launch.
GitHub holds the source; pushes do not automatically deploy either environment.

### Contact delivery and certificate monitoring

UptimeRobot Solo 10 is active. The homepage monitor has certificate-error checks
and expiry reminders at 30, 14, 7, and 0 days, with email alerts to
`tim@timgabaree.com`. Public homepage, contact-page and PDF checks run every minute.
The notification destination test was sent; that is not a simulated expired
certificate. Certificate data was populated during launch verification; continue
checking renewal/expiry status in the dashboard.
The separate receiver's `/health` endpoint is also checked every minute by
UptimeRobot monitor `804451011` and has reported Up.

`wrangler.monitoring.jsonc` deploys a separate Worker at
`https://timgabaree-com-astro-email-monitor.timgabaree-com-astro.workers.dev`.
It has no site assets, email sending credentials, custom domains, or live routes.
Public probes are `/health` (configuration health) and `/delivery-status`
(200 for no unacknowledged failure, 503 for a latched failure or unavailable state).
They return no incident details. `/resend` accepts only verified signed POST events.
`/admin/status`, `/admin/acknowledge`, and `/admin/test` require a separate bearer secret;
acknowledgement is POST-only and checks the reviewed incident revision.
`RESEND_WEBHOOK_SECRET` and `MONITOR_ADMIN_KEY` are Cloudflare secrets, never Git files.
The Resend subscription includes `email.failed`, `email.bounced`,
`email.delivery_delayed`, `email.suppressed`, and `email.complained`.

The receiver verifies the raw body using Svix, including timestamp tolerance,
limits body size, requires our application/environment tags and the fixed
recipient, and deduplicates event IDs using hashed keys for seven days. It does
not store webhook bodies. Unsupported events are silently ignored; invalid
signatures are rejected without logging attacker-controlled values. Signed
delivery failures and immediate sending failures emit the same fixed marker.
Cloudflare's older `timgabaree.com contact email failure` SQL threshold monitor
(ID `5956322cda36451d95eac81481ac9311`) is **disabled, not deleted**, as approved
on October 27 after the fallback test and confirmed automatic UptimeRobot email.
Its saved query remains scoped to the fixed marker in the three Astro Workers,
with destination `tim@timgabaree.com`, five-minute evaluation, 15-minute average,
threshold above zero, and one-hour repeat limits. Its automatic notification
delivery was never verified. Cloudflare logging remains enabled and unchanged;
UptimeRobot is the verified operational failure-alert path.

#### Persistent failure status and UptimeRobot

The primary failure monitor is UptimeRobot `804451162`, named
`timgabaree.com - Contact email failures`, checking `/delivery-status` every minute
with immediate email alerts to `tim@timgabaree.com` and hourly reminders. It accepts
2xx only and does not follow redirects. Receiver health is monitored separately.
The current monitoring Worker version is `6686f411-a606-4bd3-b265-be12cfc1dfbf`.

`DeliveryStatus` atomically stores event dedupe and the latest incident. Signed
provider failures and immediate sending errors latch unhealthy until reviewed;
a successful email or a restart cannot clear it. Application data is restricted
to fixed failure category, environment, detection time and random revision.
Hashed event IDs dedupe for seven days, with bounded cleanup scheduled within eight
days. Acknowledgement removes the incident but retains dedupe so a provider retry
does not reopen it. A newer failure changes the revision, preventing an older
acknowledgement from clearing it. Existing contact-security state is not shared.

Monitoring hardening (October 27, 2026): incident writes retry up to three times
with fresh stubs, a three-second timeout per attempt, and an unchanged dedupe key.
If the primary `contact-delivery` object cannot record an immediate application
or receiver-runtime failure, the writer uses a separate `contact-delivery-fallback`
object in the existing namespace. Both objects are checked by the unchanged
UptimeRobot URL; either incident or an unreadable state returns 503. Receiver
exceptions are now persisted, so a brief failure remains visible after recovery.
Signed-provider writes remain retryable (503), with the receiver error latched
through this fallback path. Admin status lists both incidents, and each exact
revision must be reviewed and acknowledged separately. Clearing one cannot clear
the other or a newer failure.

This is object-level redundancy, not a second storage provider. A simultaneous
failure of both Cloudflare objects still produces an error and sanitized log;
an outage that prevents all writes and ends between external probes can still
escape detection. UptimeRobot provides independent polling and email delivery,
not a guarantee that every failure or every missing inquiry can be detected.

Run `npm run test:monitoring` for local workerd tests without email or remote
state changes. The authenticated hosted diagnostic is deliberately explicit:
`node scripts/email-monitor-admin.mjs test --send-alert`. It rejects an existing
incident and injects a primary-write failure only into that request, recording
the fixed staging `monitor_self_test` issue in the real fallback. This creates an
automatic UptimeRobot alert; verify it before acknowledging its exact revision.
It does not send a contact email, change credentials, or enable a public fault switch.

Hosted hardening verification on October 27 (October 28 UTC): the diagnostic at
`2026-10-28T02:47:27.840Z` exhausted the intentionally unavailable primary writer
and persisted `monitor_self_test` in the fallback. `/delivery-status` returned
503 with an empty body while `/health` remained 200. UptimeRobot incident
`373664311771830023` confirmed DOWN at 21:48:34 America/Chicago and recorded
`Email sent to tim — SUCCESS` at 21:48:35. Tim confirmed receipt of this new
automatic DOWN alert. Only test revision `e3b67c3d-7837-431f-9681-ea92cd1c1deb`
was acknowledged; both incident slots then returned empty and the public status
returned 200. No contact email was submitted.
UptimeRobot confirmed recovery at 21:50:44 America/Chicago and recorded the
recovery email as SUCCESS at 21:50:46; this incident is Resolved. The DOWN email
has inbox confirmation; recovery email dispatch is verified in the dashboard.

Deployments: production `e0e2c6f7-736d-4013-b091-55b0c071352f`, staging
`e178c625-fbbd-4f71-bed7-a79948acbdff`, monitoring version above. Passed: 55 unit
tests, 22 local monitoring runtime checks, 88 Cloudflare runtime/build checks,
317 production configuration/build checks, 73 online staging checks, and 282
live checks after clearing the diagnostic. The live check during the intentional
incident correctly failed at the 503 probe; the post-test rerun passed.
UptimeRobot settings, Cloudflare logging and certificate notifications, GoDaddy,
and all email DNS were left unchanged. No DNS changes were made.

To review an incident, use Node from `.nvmrc`:

```bash
node scripts/email-monitor-admin.mjs status
# Only after investigating and resolving the reported failure:
node scripts/email-monitor-admin.mjs acknowledge <reviewed-revision>
```

The helper reads the key from `~/.config/timgabaree-email-monitor/admin-key` (private
directory and mode 0600 file, outside Dropbox/Git), or `MONITOR_ADMIN_KEY_FILE`.
Never put the key in a URL, shell argument, screenshot, or notes. A 200 status means
no unresolved *reported* failure, not proof that every inquiry reached an inbox.

Earlier pre-cutover automatic alert test on October 27: UptimeRobot first reported Up. A signed,
synthetic staging `email.failed` event at `2026-10-28T01:11:52.864Z` was accepted
with 204, including its duplicate. `/delivery-status` became 503 while `/health`
remained 200. UptimeRobot confirmed Down at 20:14:08 America/Chicago and recorded
`Email sent to tim — SUCCESS` at 20:14:09 in incident `373640546293387427`.
This was an automatic incident alert, not the manual notification-test button.
The reviewed test revision was acknowledged; both public probes returned 200.
A fresh signed retry of the same event remained deduplicated and did not reopen
the incident. UptimeRobot recorded recovery at 20:17:22 America/Chicago and a
successful recovery email at 20:17:24. The incident is Resolved. Tim explicitly
confirmed receipt of the automatic DOWN alert at `tim@timgabaree.com` in this
review. The failure-alert path is therefore verified end to end. Recovery email
dispatch is recorded by UptimeRobot; separate inbox confirmation of that recovery
email was not requested or supplied.

The temporary signing-secret and read-only diagnostic-token files were deleted
after verification. The permanent acknowledgement key remains mode 0600 outside
Dropbox/Git. None of these three secrets appeared in Git-visible files. The
diagnostic token itself retains its existing short expiry; deleting its local
copy does not revoke it. During that earlier pre-cutover test, live DNS and GoDaddy
were not changed; production was still disabled and its public workers.dev URL
returned 404, while live PHP returned 200. The later approved cutover supersedes
that historical access state.

#### Earlier Cloudflare SQL-monitor diagnosis (historical)

The following records the earlier investigation, before the persistent-status
monitor above was implemented and its automatic DOWN alert received. The older
SQL rule's delivery remained unverified and it is now disabled; it is not a substitute for
the verified UptimeRobot check. References below to pending verification and
temporary local credentials describe that earlier state.

**Verification still open:** the hosted signed test generated exactly one
sanitized log despite a duplicate request; unsigned requests returned 400 and
health returned 200. The event is visible in Cloudflare Workers Logs, but the
SQL monitor preview still showed zero, even in an unsaved broader diagnostic
query. An attempted manual 15-minute query was rejected by the dashboard with
`query already contains time predicates ... remove them to use time_range`;
that edit was cancelled. The original scoped rule remains enabled. A native
destination test was requested, but neither that request nor a saved rule proves
automatic failure-alert delivery. Resolve this gap and verify recipient receipt
before cutover. The receiver version after secret installation is
`e107a9da-dfc5-4554-8f41-1306db183d9f`; Resend webhook ID is
`0e765aaa-e605-42a2-90ae-99f26534c47a`. No secrets are stored in this repository.

Follow-up diagnosis on October 27: the recipient confirmed both providers'
manual test notifications. A further signed staging failure was accepted (204)
at `2026-10-28T00:49:58.349Z`, but automatic alert delivery remains unverified.
The Workers Real-Time Issues dataset had no records for this event, so the
temporary issue-based rule was reverted to the original scoped Workers Logs
rule. The existing Wrangler credential can read SQL dataset schemas, but actual
log queries and alert history return 403. A temporary account-scoped token with
Account Analytics Read, Workers Observability Read, and Notifications Read was
created with explicit user approval. It has no DNS or deployment write permissions
and expires October 28 at 20:00 America/Chicago. Its value is held in a private
temporary file outside the repository and Dropbox, not in these notes or Git.
The token successfully reads the actual SQL data, policy, and notification history.
The scoped query matches the sanitized failure logs; the earlier zero preview was
not evidence of a field/filter mismatch. Notification history distinguishes the
manual test (sent `2026-10-28T00:46:54.61858Z`, dummy test query) from real automatic
alerts. The account has no notification silences.

Further signed staging failures were accepted (204) at
`2026-10-28T00:55:29.374Z`, `2026-10-28T00:57:57.409Z`, and
`2026-10-28T01:00:27.722Z`. The query and preview detect these events, but that alone
does not verify scheduled notification delivery. Diagnostic rule changes compare
the average result against `> 0` over 15 minutes, with a five-minute execution
interval to widen the automatic query lookback. The repeat interval was temporarily
shortened during testing to rule out suppression from the manual test, then restored
to one hour. At `2026-10-28T01:05:55.552Z`, notification history still contained only
the manual test, despite multiple matching failure records and no account silences.
A quiet baseline (`00:52–00:54Z`) returned zero; the isolated `01:00–01:01Z` failure
returned one. This establishes matching, not automatic delivery. The scheduled
notification path remains unresolved; do not describe this diagnostic rule as a
verified fix. Automatic alert verification remains an open cutover gate until a
real scheduled notification is recorded and received. Consider Cloudflare support
or, with user approval, a persistent failure-status signal checked by UptimeRobot
on the separate monitoring Worker, independent of SQL-log alert evaluation.

The temporary webhook-signing-secret copy was removed after testing. Both secret
values were checked against Git-visible files with no matches. The restricted
read-only token remains private outside the repository until its short expiry.
No code deployment, DNS, GoDaddy, or production-access changes were made in this
follow-up. The deployed production version still has `PRODUCTION_ENABLED=false`;
its public workers.dev URL returns 404. All 177 production configuration/build
checks and 10 focused email-monitor tests passed again.

Tests cover signatures, tampering, stale/future timestamps, bounds, deduplication,
privacy, and adapter failures. A signed synthetic hosted failure tests our
receiver, not Resend's real delivery pipeline. Monitoring detects reported
failures; API acceptance, absence of alerts, and even delivery events do not
prove inbox placement or that a person read the message. `/health` checks
configuration presence, not Resend credentials or inbox delivery. Retain the
approved real-domain contact test as a cutover gate.

### Completed review and post-launch follow-up

Analytics uses a local opt-in gate: no Google preconnect, iframe or tag load
before acceptance. The compact cookie notice offers equally prominent allow/decline
controls, plus dismissal without consent; footer “Privacy choices” reopens it.
Preferences expire after 180 days;
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

The post-launch review verified Google's network requests, measurement cookies
and withdrawal; the compact-notice release rechecked request acceptance and
withdrawal as recorded above. The shared GTM container also remains referenced
by the archived PHP site; keep new tracking scoped to Astro production.

Contact-success reporting was enabled on October 27, 2026 in GTM `GTM-ML7T9TJ8`,
published version 15, “Measure consented Astro contact submissions.” Exactly
three entities were added: a DOM variable reading `data-analytics-enabled` from
`#analytics-choices`, a custom-event trigger, and a GA4 event tag. Existing tags
were unchanged; the workspace had zero pending changes after publication.
The trigger requires the exact `contact_form_submission` event, hostname
`timgabaree.com`, path `/thank-you`, and the Astro production marker `true`.
The tag additionally requires granted `analytics_storage` consent and sends
`generate_lead` to `G-WV3F87ZRF2`, with only fixed `form_name` (Continue the
Conversation) and `form_location` (/contact) event parameters. No submitted
name, email address, phone, organization, topic or message is included.

GA4 property `440546535` registers `generate_lead` as a key event, counted once
per event with no default monetary value. The existing server-side one-time
flag is set after Resend accepts a message, not after confirmed inbox delivery.
Failed sends, honeypots, dry runs and ordinary thank-you visits do not qualify.
Google reports only consented, unblocked browser events, not every inquiry.

One user-approved live contact test was sent to `tim@timgabaree.com`. The form
reached `/thank-you`; the conversion response was `true`, and Google's collection
endpoint accepted exactly one `generate_lead` request with HTTP 204. Refreshing
the page returned `converted: false` and did not send a second lead event.
GA4 Realtime then showed `generate_lead` with event count 1 and key-event count 1.
The test browser's original declined-cookie preference was restored afterward.
Use Reports > Realtime overview for immediate checks; use the Events report
under Engagement and select `generate_lead` for processed historical reporting.
The approved test is included in the initial count; tracking is not retroactive.
All 28 focused contact/privacy tests passed with mocked provider calls. No
Astro deployment, GoDaddy change or DNS change was needed for this setup.

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

The approved cutover and real-domain email gate are complete, as recorded above.
Keep monitoring enabled and review Cloudflare/Resend usage as traffic develops.
Phone testing remains explicitly deferred; contact-conversion reporting is now
configured above, while a fuller analytics network/cookie audit is separate. No new
scheduled automation was created by the cutover. Privacy disclosures describe
implementation, not a legal compliance audit.

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
access-restricted but not independently encrypted. A second, plain ZIP archive
was subsequently created at the user's explicit request (no password):
`/Volumes/StudioStack NVMe/Dropbox/Work Files/Websites/Archive/timgabaree.com-GoDaddy-2026-10-27/godaddy-timgabaree.com-backup.zip`.
Its SHA-256 is `94e42aeb8336284eac08d426ec21dbf385dbccb7fe23521612a58c4202505174`.
The checksum and ZIP integrity were rechecked for this source-control release.
The user will verify Dropbox cloud synchronization later; a local copy does not
prove off-device sync. Both archives stay outside Git. No GoDaddy source removal
or hosting cancellation is authorized.
The original archive report is historical: its TLS 1.0 note and older test counts
predate the later TLS hardening and this production refresh.

Website rollback values confirmed in the pre-cutover snapshot: apex A
`72.167.204.130`, www CNAME `timgabaree.com`, both proxied with TTL Auto. Do not
blindly import the full DNS export or overwrite unrelated changes.

The launch evidence folder records the DNS snapshots and attached Custom Domains.
Only the website hostnames moved. MX, mailbox authentication records, Resend
sending records and every other hosted domain were left unchanged.

If critical checks fail, remove/disable the new website bindings and restore the
saved website DNS/routing settings, then verify the PHP site. Keep the deployed
GoDaddy files and domain mapping intact for rollback and archive. Do not delete
the addon domain, its folder, the `rgesol.com` primary site, or the shared Web
Hosting Deluxe account. Changing website DNS later does not require removing
those files or cancelling hosting.
Restore website traffic to GoDaddy before re-locking Astro: disabling Astro alone
while its domain bindings remain active would return 503 instead of restoring PHP.

## Homepage accessibility and mobile performance (October 27, 2026)

Published production version `d59fcf0b-ae40-4d91-88af-b8dec825bef6` after local
visual and keyboard checks. The homepage and About page now use a single contact
link around the QR image and caption, preserving the original image/caption
positions and visible text while eliminating adjacent undersized targets.

`scripts/optimize-images.mjs` generates AVIF display derivatives before
`npm run dev`, `npm start`, and the normal staging/production builds. Generated files in
`public/media/optimized/` are ignored by Git and recreated from the untouched
original WebP files. The originals remain the browser fallback and continue to
serve the sitemap and social metadata. The background stays 1920x942 and drops
to 84,188 bytes; portrait variants are 360/600/900 pixels wide, with the 600-wide
version at 17,821 bytes. The preload matches the AVIF source and its MIME type.
The hidden hover portrait is low priority. Published CSS is minified; readable
source remains intact. Slide and fade keep their original timings but no longer
both animate opacity. Reduced-motion behavior is preserved.

Fresh PageSpeed report `sdtvb113p1`, captured approximately 21:56 America/Chicago:

| Metric | Earlier mobile | Updated mobile | Updated desktop |
| --- | --- | --- | --- |
| Performance | 84 | 96 | 100 |
| Accessibility | 96 | 100 | 100 |
| Best practices / SEO | 100 / 100 | 100 / 100 | 100 / 100 |
| Largest Contentful Paint | 3.8 s | 2.6 s | 0.7 s |
| Speed Index | 5.2 s | 3.0 s | 0.8 s |
| Blocking time / layout shift | 0 / 0 | 0 / 0 | 0 / 0 |

[Mobile report](https://pagespeed.web.dev/analysis/https-timgabaree-com/sdtvb113p1?form_factor=mobile)
and [desktop report](https://pagespeed.web.dev/analysis/https-timgabaree-com/sdtvb113p1?form_factor=desktop).
These are lab results, not field data or a guarantee of future scores. Automated
accessibility does not replace manual testing. Additional image compression is
still suggested by Lighthouse; the current settings preserve the design and
image detail rather than treating a perfect speed score as the only goal.

Verification: 59 unit tests, 328 production configuration/build checks, 88 local
Cloudflare runtime/build checks, and 298 read-only live checks passed. Desktop
before/after review preserved layout and QR spacing. A 390x812 phone preview had
no horizontal overflow and selected the 600-wide portrait. The QR link has one
keyboard stop on both pages; Enter opened the contact page on the homepage test.
Staging was built/tested locally but not redeployed in this performance pass.
No contact email, DNS, GoDaddy, analytics-consent, or monitoring-settings changes
were made. These changes and the monitoring hardening are included in the
user-approved GitHub source-control release; pushing source does not redeploy.

## Project structure

- `src/` — Astro pages, metadata and shared layout/components
- `public/` — site assets and downloads
- `worker/` — Cloudflare routing, staging authentication, contact form and state
- `scripts/prepare-cloudflare.mjs` — safe static build preparation
- `tests/`, `scripts/test-cloudflare.mjs` — unit and local runtime tests
- `server-php/` — retained legacy reference; never uploaded to Cloudflare
