# Astro operations guide

Updated October 28, 2026 from repository configuration and recorded launch
evidence. Versions and historical test counts are centralized in the
[README](../README.md). Original timestamps, incident IDs, intermediate versions
and detailed test results remain in the
[archived launch record](history/2026-10-27-launch-record.md).

## Environments and release boundaries

| Environment | Configuration | Purpose |
| --- | --- | --- |
| Local | `wrangler.jsonc` with preview overrides | Loopback-only preview; no email |
| Staging | `wrangler.jsonc` | Separate workers.dev site, Basic Auth and noindex |
| Production | `wrangler.production.jsonc` | Apex/www Custom Domains; `PRODUCTION_ENABLED=true`; workers.dev/preview URLs disabled |
| Email monitor | `wrangler.monitoring.jsonc` | Separate signed-event receiver and persistent failure status |

Staging: <https://timgabaree-com-astro-staging.timgabaree-com-astro.workers.dev>.
Monitor: <https://timgabaree-com-astro-email-monitor.timgabaree-com-astro.workers.dev>.
Production and staging have separate contact-security state and email credentials.
Only sanitized failure status is shared with the monitoring Worker.

All site requests pass through the Worker, including assets and form endpoints.
Staging requires `STAGING_USER` and `STAGING_PASSWORD`, fails closed without them,
and sends private/no-store/noindex responses. Credentials are in Cloudflare
secrets and the ignored local `.dev.vars`, never documentation.

Source publication and deployment are separate approvals. Confirm the intended
Cloudflare account and configuration before upload. Updating staging does not
update production. Do not attach production domains to staging or enable automatic
deployments as an incidental change.

## Validation and deployment

Select `.nvmrc` with `nvm use`; install lockfile dependencies with `npm ci`.

| Command | Scope / side effects |
| --- | --- |
| `npm run check` | Astro and Worker TypeScript diagnostics |
| `npm test` | Unit tests; provider calls mocked |
| `npm run test:monitoring` | Isolated local workerd monitoring tests; no remote incidents/email |
| `npm run build` | Default staging-safe build in `dist/`; generated image derivatives |
| `npm run test:integration` | Isolated local Worker on port 8791; temporary test state |
| `npm run prepare:production` | Checks/tests, production build/checks and deployment dry run; no upload/DNS/email |
| `npm run test:live` | Read-only public endpoint checks; no form submission |
| `npm run test:staging` | Authenticated online checks using `.dev.vars`; no message submission with email enabled |
| `npm run deploy:staging` | Checks/build/local integration tests, then staging upload; requires deployment approval |

After an approved production upload, run the read-only live suite and inspect
changed pages. A Git commit or successful build does not prove a version is live.
Real contact tests and `npm run test:staging -- --send-email` require explicit
approval for the recipient and purpose.

Normal builds strip Apache configuration and reject PHP/unexpected hidden files;
`.assetsignore` adds upload protection. AVIF derivatives in
`public/media/optimized/`, `dist/`, `dist-production/` and `worker-build/` are
generated and excluded from Git. Original WebP assets remain fallbacks.
`build:legacy-php` and `preview:legacy-php` are local comparison tools only.
Never serve that output through a generic static server: it contains PHP source.
Rebuild with the normal Cloudflare build before Cloudflare upload.

## Contact email and privacy

Resend sends from `website@forms.timgabaree.com` to the fixed server-side recipient
`tim@timgabaree.com`. Visitor email is Reply-To, not a recipient override. Each
environment has a separate sending-only API key restricted to `forms.timgabaree.com`.
`RESEND_API_KEY`, `CONTACT_FROM` and `CONTACT_TO` are Cloudflare secrets.
Remote delivery uses `CONTACT_MODE=resend`; local preview overrides it to `dry-run`.
Staging subjects have a `[STAGING]` prefix.

Retain enforced TLS delivery and disabled open/click tracking. Do not alter MX,
SPF, DKIM, DMARC or sending-domain records during routine deployments. The site's
configured minimum TLS is 1.2; TLS 1.3 remains enabled. Real staging,
private-production and post-cutover contact delivery were confirmed October 27.
Provider acceptance is not proof of inbox placement or reading.

Contact tokens and conversion flags expire after one hour. Rate counters expire
after ten minutes (issuance counters after one minute). No submitted message,
name, email or raw IP is stored in contact-security state. Application error logs
contain the fixed `TG_CONTACT_ALERT` marker, environment and failure category,
not message contents, credentials or provider responses. Invocation logs are
disabled; Cloudflare may add operational metadata.

## Monitoring and incident response

UptimeRobot Solo 50 annual is the alert path. Tim clarified `tim@timgabaree.com`
as the alert destination on October 29; login remains `timgabaree@gmail.com`. Seven active Tim checks cover homepage
content/TLS (804475314), exact www redirect/TLS (804475315), contact-page markup
(804475327), form readiness (804475328), PDF (804450935), receiver health
(804451011), and persistent contact failures (804451162). Homepage/email checks
run every minute, www/contact checks every five minutes, and PDF HEAD checks every
15 minutes. Old homepage/contact checks are paused with history preserved.
Certificate expiry reminders at 30/14/7/0 days apply once per hostname, and the
tim@timgabaree.com contact's expiry notifications are enabled. Tim's existing homepage SMS/voice
channels are retained on the replacement homepage monitor.

The full five-site inventory and configuration script are maintained in the sibling
`carriegabaree.com-astro/MONITORING.md` and `scripts/fleet-monitoring.mjs`. There are
23 active fleet checks plus six paused historical checks, no active duplicate
endpoints. The October 29 reorganization left Tim's receiver unchanged; the
October 30 recovery release is documented below. A notification test does
not simulate an expired certificate, and no recurring contact emails are sent.

- `/health` reports configuration presence, not provider credentials or delivery.
- `/delivery-status` returns 200 if no unresolved incident exists, otherwise 503
  for a latched incident or unreadable state. No incident details are public.
- `/resend` accepts signed events with timestamp/body limits, expected application,
  environment and recipient filters, and seven-day hashed event deduplication.
- Failure categories include failed, bounced, delayed, suppressed and complained
  provider events, immediate send errors and receiver runtime errors.
- Writes retry three times with a three-second timeout per attempt. A separate
  fallback Durable Object records immediate/receiver errors when the primary
  cannot persist them. Both are checked. Recovery rules are below.

This is object-level redundancy within Cloudflare, not a second storage provider.
A simultaneous write outage ending between polls can escape detection. A healthy
probe means no unresolved *reported* failure, not that every inquiry arrived.

Use Node from `.nvmrc` to inspect an incident:

```bash
node scripts/email-monitor-admin.mjs status
```

Most resolved incidents now recover automatically. Investigate alerts while they
are active. If manual recovery is needed, review every incident and only after
resolution acknowledge the exact reviewed revision:

```bash
node scripts/email-monitor-admin.mjs acknowledge <reviewed-revision>
```

Each slot needs its own acknowledgement. Revision checks prevent clearing a newer
failure; deduplication prevents retries reopening an old one. The helper reads
a mode-0600 key outside Dropbox/Git at
`~/.config/timgabaree-email-monitor/admin-key`, or `MONITOR_ADMIN_KEY_FILE`.
Never place credentials in URLs, arguments, screenshots, Git or chat.

### Automatic recovery — October 30, 2026

- A signed Resend `email.delivered` event clears delivery failures only for the
  matching site, environment and configured recipient, and only when the event
  occurred after the failure was recorded. Missing, future or stale timestamps,
  unrelated mail, form thank-you pages and `email.sent` do not clear incidents.
- A one-minute Cloudflare Cron Trigger checks reads and writes on every monitor
  store. Runtime incidents clear after at least three spaced healthy checks over
  two minutes, with a minimum incident age of three minutes. A failed check
  records a fresh runtime incident; a gap over 150 seconds restarts the streak.
  Public requests cannot advance recovery.
- Production/staging and delivery/runtime/test incidents are kept separately.
  Manual diagnostic tests still require acknowledgement. Local tests cover
  recovery, restarts, stale notifications, concurrent incident categories and
  site/environment isolation.
- The last 100 resolved/superseded records per store retain only revision,
  environment, operational code, timestamps and resolution. Read with
  `node scripts/email-monitor-admin.mjs history`. UptimeRobot history is unchanged.
- Resend's existing five failure events remain subscribed; `email.delivered`
  is added to the same verified webhook. No keys, recipients or email DNS change.
- Delivery means recipient-server acceptance, not guaranteed inbox placement.
  Quarantine and mail rules can still hide accepted mail.

Monitor-only release: `8a50dacb-3ae0-4015-82b4-bcbd020b5423`.
Previous version: `6686f411-a606-4bd3-b265-be12cfc1dfbf`.
Do not casually roll back the status-store schema: old code understands only one
summary incident; retain this multi-incident reader/writer when repairing a release.
No website deployment or new contact inquiry was performed.
Verification: 83 unit tests, 28 local workerd runtime checks, Worker TypeScript
checks and deployment dry run passed. Local signed failure/delivery events recovered
without manual acknowledgement and remained recovered after restart; unit tests
verified timed runtime recovery. Live private stores were empty and both Tim
email monitors were UP. No synthetic live outage/recovery notification was sent.

Only for an explicitly approved hosted alert test:

```bash
node scripts/email-monitor-admin.mjs test --send-alert
```

This rejects existing incidents, injects a request-local primary-write failure,
and latches a labeled staging `monitor_self_test` in the fallback. It triggers
an actual UptimeRobot email, not a contact email. Confirm delivery, acknowledge
only the test revision, and verify recovery. The October 27 fallback test's DOWN
email was received by the owner; recovery dispatch and resolved status were verified.

The older Cloudflare SQL contact-failure alert is **disabled, not deleted**.
Its automatic delivery was not verified; the old investigation is historical,
not an open launch gate. Keep Cloudflare logging, certificate alerts and
UptimeRobot enabled. Do not silently re-enable or remove the SQL rule.

## Analytics, sitemap and accessibility

Google Analytics loads only after opt-in through the compact non-modal cookie
notice. Allow and Decline have equal prominence; dismissing does not consent.
Footer Privacy choices reopens controls. Preferences expire after 180 days;
unavailable storage fails closed. Withdrawal removes known first-party Google
measurement cookies and reloads to unload tags. Advertising consent stays denied.
Local/staging hostname and build guards prevent Google measurement there.

Cloudflare's edge-injected cookie-free Web Analytics is independent of the Google
choice; do not add a duplicate beacon. No IP-to-person lookup or fingerprinting
feature is implemented. Privacy text describes behavior, not a legal compliance audit.

GTM `GTM-ML7T9TJ8` version 15 added consented contact reporting to GA4
`G-WV3F87ZRF2` / property `440546535`. The trigger requires
`contact_form_submission`, exact apex hostname, `/thank-you` and the Astro
production marker. The tag requires granted `analytics_storage` and sends
`generate_lead` with fixed form name/location only, never submitted personal data.
The shared GTM container also serves legacy PHP; retain this Astro-only scoping.

The server issues a one-time conversion after provider acceptance. Failed sends,
dry runs, honeypots, direct thank-you visits and reloads do not create another
lead. GA4 counts `generate_lead` as a key event; only consenting, unblocked browsers
are counted, not every inquiry. The approved test produced one event and one key
event in Realtime; it remains in the initial count. Use Realtime for new activity
and the Events report for processed history. Tracking is not retroactive.

`/sitemap` is build-time HTML with 29 page-image entries (20 distinct files)
grouped under seven pages. `/sitemap.xml` remains the crawler source, referenced
by robots.txt. There is no XSLT dependency; `/sitemap.xsl` intentionally returns 404.
Regression checks cover thumbnails, original-image links and page associations.

For the dated Search Console results, see
[Google indexing verification](../README.md#google-indexing-confirmed-october-28-2026).
Compare the aggregate report's update date with individual URL Inspection results;
older exclusion totals can lag newly indexed pages. Sitemap Success confirms
processing, not that every discovered URL is indexed. Keep redirect/legacy-host
examples separate from the current Astro URLs when reviewing exclusions.

Calendly loads only after Schedule is activated. A native dialog, titled iframe,
Close buttons, focus restoration and direct-link fallback provide keyboard access.
Cross-origin iframe keys remain Calendly-controlled. QR images/captions form a
single link. Maintain reduced-motion support and original layout when optimizing.
Physical-phone testing is deferred, not passed; automated scores do not replace
manual accessibility checks.

## Archive and rollback safeguards

The October 27 archive came from the deployed GoDaddy addon-domain root, not the
local PHP checkout: 144 regular files (166 entries), excluding sibling sites.
Extraction matched remote file hashes. No live or complete Apache restoration
was tested; no site-specific database or active hosting-user cron dependency was
identified. Account-wide mailboxes/services and TLS private keys are excluded.

- Original tar: `/Volumes/StudioStack NVMe/Website Archives/timgabaree.com/2026-10-27-pre-cutover/godaddy-timgabaree.com.tar.gz`.
  SHA-256: `b918d619387ad48ef8ff14931da0ebeea1827a065f891cf2cdc9be3342753886`.
- Second plain ZIP, no password as requested:
  `/Volumes/StudioStack NVMe/Dropbox/Work Files/Websites/Archive/timgabaree.com-GoDaddy-2026-10-27/godaddy-timgabaree.com-backup.zip`.
  SHA-256: `94e42aeb8336284eac08d426ec21dbf385dbccb7fe23521612a58c4202505174`.
- Checksums/ZIP integrity were verified October 27. Off-device Dropbox sync awaits
  owner confirmation; local existence does not establish cloud synchronization.
- Launch DNS snapshots/evidence remain outside Git in
  `/Volumes/StudioStack NVMe/Website Archives/timgabaree.com/2026-10-27-launch/`.

Rollback requires explicit approval and a fresh review of website records.
Saved values are apex A `72.167.204.130` and www CNAME `timgabaree.com`,
both proxied with TTL Auto. Do not import an entire old DNS export over current
mailbox, Resend or unrelated records. Remove/disable conflicting Astro website
bindings and restore approved website routing, then verify PHP before re-locking
Astro. Disabling Astro alone while its domain bindings remain active would serve
503, not restore GoDaddy.

Retain GoDaddy files, addon-domain mapping and shared Web Hosting Deluxe account.
`rgesol.com` is the primary domain; other sites depend on that account.
No deletion, hosting cancellation, email-DNS change or rollback is authorized
by an ordinary documentation or source-control update.
