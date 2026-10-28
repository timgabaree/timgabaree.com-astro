# timgabaree.com — Astro site

The live site runs on Cloudflare Workers at [timgabaree.com](https://timgabaree.com).
`www` redirects to the apex. This repository is separate from the legacy PHP
project; GoDaddy files and shared hosting are retained for archive and rollback.

## Start here

- [Operations guide](docs/OPERATIONS.md): environments, checks, email monitoring,
  analytics, backups and rollback safeguards.
- [October 27 launch record](docs/history/2026-10-27-launch-record.md): preserved
  test evidence and deployment history, not current operating instructions.
- [Source repository](https://github.com/timgabaree/timgabaree.com-astro): `master`.
  Git pushes do **not** deploy the website.

## Status reviewed October 28, 2026

GitHub and the local checkout matched application release
[`1ed2e58`](https://github.com/timgabaree/timgabaree.com-astro/commit/1ed2e58c69a84e21a4309f204bee9bd4deddaeba)
before this documentation-only cleanup. Browser access was confirmed under
`timgabaree`; GitHub currently reports this repository as public. No visibility
or account settings were changed during this review.

Production's version was rechecked before and after the October 28 staging
deployment and is unchanged. Staging was updated October 28; the monitoring
version remains the October 27 record, not a fresh monitoring audit.

| Environment | Recorded version | State at last deployment |
| --- | --- | --- |
| Production | `d59fcf0b-ae40-4d91-88af-b8dec825bef6` | Live; monitoring, QR accessibility, mobile performance and privacy-spacing fixes |
| Staging | `3f14b5fb-66f3-4578-8cfd-6aa5c88eb679` | Updated October 28 with QR/performance changes; password protection and hosted asset checks passed |
| Email monitor | `6686f411-a606-4bd3-b265-be12cfc1dfbf` | Persistent primary/fallback failure status; automatic DOWN alert received and recovery recorded |

Included features:

- Compact cookie notice; Google Analytics opt-in and independent cookie-free
  Cloudflare Web Analytics. Footer privacy controls remain available.
- Consented contact-success reporting as GA4 `generate_lead`, verified end to end.
- XSLT-free HTML sitemap with image gallery; XML sitemap retained for crawlers.
- Keyboard-accessible Calendly controls and a single QR image/caption link.
- Responsive AVIF images, matching preloads and minified published CSS, preserving
  original assets and the site's appearance.
- Resend contact email with enforced TLS; UptimeRobot failure/certificate alerts.
  The older Cloudflare SQL alert is disabled, not deleted.

## Local development

Use Node **24.22.1** from `.nvmrc` (the system Node 16 is too old):

```bash
nvm use
npm ci
npm run dev
```

Pages preview at `http://127.0.0.1:4321`. For the local Cloudflare contact handler,
run `npm run build` then `npm run preview` at `http://127.0.0.1:8787`.
Local preview always uses no-email mode; successful test submissions do not
claim real delivery. See the operations guide for validation and deployment scope.

## Latest recorded verification

October 28 staging update from source `1154bdc`: zero Astro/TypeScript diagnostics,
59 unit tests, 88 local runtime/build checks, 73 online staging checks and 29
additional hosted QR/image/CSS checks passed. Homepage/About HTML, all four AVIF
images and the stylesheet match the fresh staging build exactly. Optimized images
return 401 without authentication; Google analytics remains disabled on staging.
All 298 read-only live checks also passed; production's deployed version is unchanged.
No contact email was submitted. After the owner handled Chrome's look-alike-address
warning, authenticated browser review confirmed a single named QR link on Home
and About: Tab advances to the phone link, Shift+Tab returns to the QR link, and
Enter opens staging's contact page. Desktop layout and a 390x812 responsive
preview were reviewed; Home and About have no horizontal overflow. The narrow
homepage loads the 600-pixel AVIF portrait, while desktop loads the 900-pixel
version. Google tag scripts remain absent. This is browser emulation, not a
physical-phone test or a new PageSpeed measurement.

The October 27 release passed 59 unit tests, 22 monitoring-runtime checks,
328 production build/configuration checks, 88 local runtime checks,
298 read-only live checks and 73 online staging checks. These are recorded
release results, not tests rerun by the October 28 documentation cleanup.

PageSpeed lab results: **mobile 96 performance / 100 accessibility**;
**desktop 100 / 100**. Best practices and SEO were 100 on both.
[Mobile report](https://pagespeed.web.dev/analysis/https-timgabaree-com/sdtvb113p1?form_factor=mobile)
and [desktop report](https://pagespeed.web.dev/analysis/https-timgabaree-com/sdtvb113p1?form_factor=desktop).
Lab scores vary and do not prove real-device performance or complete accessibility.

### Google indexing confirmed October 28, 2026

Read-only Search Console URL Inspection confirmed **Page is indexed / URL is on
Google** for `/governance`, `/technology-leadership`, `/value-creation` and the
new HTML `/sitemap`. The three previously pending content pages were crawled by
Googlebot smartphone on October 27; each reported a successful fetch, crawling
and indexing allowed, and the inspected URL as Google's selected canonical.

The submitted XML sitemap reports **Success**, last read October 27, with eight
discovered pages. Discovery count is not an indexed-page count. The aggregate
Page indexing report still has an October 22 update date and shows five indexed
and ten excluded URLs; it has not caught up with these individual inspections.
Its one "Crawled - currently not indexed" example is `https://hello.timgabaree.com/`,
not an Astro page. The four other sitemap URLs were not individually re-inspected
in this follow-up, so this is not a fresh eight-page indexing audit.

No Request indexing, Validate fix, sitemap resubmission or configuration change
was performed. The live site, GoDaddy and all email DNS were unchanged.

## Remaining follow-up

- Confirm the second GoDaddy archive has synced to Dropbox off-device.
- Physical-phone testing remains deferred by the owner; desktop and responsive
  preview checks are recorded, not a completed phone test.
- Continue Search Console indexing, analytics, certificate/uptime, Resend delivery
  and usage/quota reviews. The previously pending content pages are now confirmed
  indexed; allow the aggregate report to catch up rather than treating its old
  totals as new failures. Do not infer indexing from sitemap discovery alone.

The October 28 deployment changed only staging. Production, GoDaddy, DNS,
monitoring settings and credentials were unchanged; no contact email was sent.

## Project layout

- `src/` — Astro pages, layouts and components.
- `public/` — original assets, sitemap and downloads; optimized images are generated.
- `worker/` — routing, authentication, contact security and email monitoring.
- `scripts/`, `tests/` — build preparation and regression checks.
- `docs/` — operations and clearly separated historical evidence.
- `server-php/` — legacy reference only; never uploaded in a Cloudflare build.

Keep secrets, archives, generated builds/images and screenshots out of Git.
Do not alter GoDaddy's shared Web Hosting Deluxe account (`rgesol.com` is primary),
the PHP sibling, other hosted sites or mailbox/Resend DNS as routine Astro work.
