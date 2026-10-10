# FallsFix on Vercel

Owner-selected host: Vercel. Canonical production origin: `https://fallsfix.com`. Intended first administrator: `siphomoyo893@gmail.com`. Domain ownership/DNS, a Vercel project, hosted PostgreSQL, SMTP delivery and account verification are not yet confirmed. No hosted deployment has been performed.

The owner confirmed on 2026-10-10 that the Vercel project and hosted PostgreSQL database do not yet exist, and the intended administrator has not registered/verified a FallsFix account. SMTP provider choice remains unanswered. Set up these services before hosted verification; never provision the administrator before email verification.

## Project and database

Import `sipho2015/FallsFix` from GitHub into the owner's Vercel account, using the repository root and Next.js preset. `vercel.json` installs with `npm ci` and checks release configuration before building. Select Node 24 and verify the actual build runtime satisfies package.json (at least 24.16, below 25). Vercel runs Next.js functions; do not configure `npm start` as a hosted process or use static export.

Provision hosted PostgreSQL with a restricted application role, TLS and backup/restore support. Use the provider's supported pooled connection URL for application traffic; use a migration-capable direct connection for migrations if required. Place the function near the database, checking the provider's connection allowance against the per-instance pool of five connections. Private photos live in the database, so capacity and backups must include them. Preview deployments must use a separate database and email configuration, never production customer data.

## Private environment variables

Configure these in Vercel's **Production** environment; never commit actual credentials:

| Variable | Production value |
| --- | --- |
| `SITE_URL` | `https://fallsfix.com` |
| `BETTER_AUTH_URL` | `https://fallsfix.com` |
| `BETTER_AUTH_SECRET` | A private randomly generated secret of at least 32 characters |
| `DATABASE_URL` | Hosted PostgreSQL application connection URL |
| `AUTH_EMAIL_TRANSPORT` | `smtp` |
| `AUTH_CLIENT_IP_HEADER` | `x-vercel-forwarded-for` for direct Vercel hosting |
| `SMTP_HOST`, `SMTP_PORT` | Confirmed mail service; port 465 or 587 |
| `SMTP_USER`, `SMTP_PASSWORD` | Private SMTP credentials |
| `SMTP_FROM` | A sender authorized by that mail service |

The administrator Gmail address alone does not establish an SMTP provider or sender authorization. Confirm whether Gmail is also intended for mail delivery; do not use a normal Gmail password as SMTP credentials. Configure sender authentication according to the selected provider.

Vercel documents its [forwarded request headers](https://vercel.com/docs/headers/request-headers); confirm the chosen header supplies one real client IP with deployed registration/rate-limit tests, especially if another proxy is added. The application rejects lists as individual IPs. Set each preview's two origin variables to its own stable HTTPS preview origin and configure its own complete environment before building.

## Domain and rollout

1. Back up the hosted database, then apply migrations and seed reference data through a trusted operator environment with its private database URL. Seeding preserves edits and keeps new categories inactive. Do not run seed or migrations from every preview build.
2. Configure the private variables and connect `fallsfix.com` under the Vercel project's Domains settings. Use the exact DNS records Vercel supplies; do not guess registrar values. Configure `www.fallsfix.com` to redirect to the canonical apex if that alias is wanted.
3. Deploy and verify HTTPS, `/api/health`, registration/verification/recovery mail, logout, role denial and private photo upload/download. Use [the acceptance checklist](acceptance.md). Keep noindex during the pilot.
4. Register and verify the intended owner on the deployed application. Only then run `npm run admin:bootstrap -- siphomoyo893@gmail.com` against the confirmed production database, followed by the prepared owner-settings script. These are deliberate audited operator commands, never build hooks.
5. Install monitoring and database backups. Schedule the existing guarded photo-cleanup CLI on a trusted scheduled runner with private database access; Vercel does not run local CLI scripts periodically by itself. Do not claim retention scheduling is complete until executions and failure alerts are verified. Agree backup expiry and holds separately.
6. Conduct the actual operator pilot and record the launch decision. Verify rollback to a compatible application artifact without dropping financial/audit data.

Vercel's [function payload limit](https://vercel.com/docs/functions/limitations#request-body-size) is 4.5 MB. FallsFix now limits raw photo uploads to 4 MiB (shown as 4 MB) in the client, bounded request reader and image decoder. Existing stored photos remain unchanged; validate their downloads on the host. If larger evidence files become necessary, design private direct object-storage uploads with authorization and retention rather than raising the function-body limit.
