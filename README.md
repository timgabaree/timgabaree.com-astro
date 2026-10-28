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

The last recorded deployments are below, verified on October 27. This
documentation review does not claim a new deployment or fresh Cloudflare audit.

| Environment | Recorded version | State at last deployment |
| --- | --- | --- |
| Production | `d59fcf0b-ae40-4d91-88af-b8dec825bef6` | Live; monitoring, QR accessibility, mobile performance and privacy-spacing fixes |
| Staging | `e178c625-fbbd-4f71-bed7-a79948acbdff` | Password-protected; monitoring hardening present, latest QR/performance updates not yet deployed |
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

The October 27 release passed 59 unit tests, 22 monitoring-runtime checks,
328 production build/configuration checks, 88 local runtime checks,
298 read-only live checks and 73 online staging checks. These are recorded
release results, not tests rerun by the October 28 documentation cleanup.

PageSpeed lab results: **mobile 96 performance / 100 accessibility**;
**desktop 100 / 100**. Best practices and SEO were 100 on both.
[Mobile report](https://pagespeed.web.dev/analysis/https-timgabaree-com/sdtvb113p1?form_factor=mobile)
and [desktop report](https://pagespeed.web.dev/analysis/https-timgabaree-com/sdtvb113p1?form_factor=desktop).
Lab scores vary and do not prove real-device performance or complete accessibility.

## Remaining follow-up

- Confirm the second GoDaddy archive has synced to Dropbox off-device.
- Deploy the latest QR/performance changes to protected staging when requested.
- Physical-phone testing remains deferred by the owner; desktop and responsive
  preview checks are recorded, not a completed phone test.
- Continue Search Console indexing, analytics, certificate/uptime, Resend delivery
  and usage/quota reviews. Do not infer all pages are indexed from sitemap submission.

No new scheduler, deployment, contact email, DNS change, GoDaddy change or
monitoring-setting change is part of this documentation update.

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
