# Deployment and launch

The application can be built locally. A hosting account, domain, production PostgreSQL database, SMTP provider, trusted HTTPS reverse proxy, and administrator identity have not been supplied. These are external configuration gaps, not phase-approval requests.

## Release procedure

1. Provision a supported Node 24 runtime and PostgreSQL. Use a restricted application account; keep the migration/deployment account separate where the host supports it.
2. Supply private DATABASE_URL, BETTER_AUTH_URL (HTTPS origin), BETTER_AUTH_SECRET, AUTH_EMAIL_TRANSPORT=smtp, SMTP_HOST, SMTP_PORT (465 or 587), SMTP_FROM, SMTP_USER, SMTP_PASSWORD, and AUTH_CLIENT_IP_HEADER. The proxy must overwrite that header with a single actual client IP; never pass an untrusted incoming value. Set SITE_URL to the same canonical public HTTPS origin.
3. Run npm ci, npm run check, and the test suites against a separate fallsfix_test database. Never point TEST_DATABASE_URL or a shadow database at production.
4. Take a database backup before migrations. Run npm run db:deploy and npm run db:seed. Seeding preserves existing edits and keeps new categories inactive. Run npm run release:check and npm run build. Start npm start behind the HTTPS proxy.
5. Check /api/health from the monitoring service and verify real registration, email delivery, login, request submission, permission denial, photo upload, quote approval, invoice access, and logout. Check each service image and the supplied logo.
6. Register and verify the intended owner, then provision the first administrator using npm run admin:bootstrap -- verified-owner@example.com. Do not create shared/default passwords. Configure invoice identity, confirm coverage, verify technicians, and activate only covered categories.
7. Set proxy body limits just above the 5 MB photo limit, request timeouts, and per-IP abuse controls. Application limits remain enforced as well. Add HTTPS-only HSTS after the domain's HTTPS configuration is confirmed. Restrict database network access and administrative tools.
8. Alert an assigned operator on failed health checks, mail failures, repeated application errors, storage growth, and backup failures. Error responses include correlation references without raw database details or secrets.

## Backup and restore

Local drill: npm run db:restore-drill. It permits only local fallsfix_dev, uses pg_dump custom format, creates an isolated timestamped restore database, runs pg_restore with error checking, compares counts for core/financial/photo/audit/migration tables, and removes only the temporary database it created. Archives remain private under .local/backups. Stop application writes during the comparison. POSTGRES_BIN can select the installed PostgreSQL binaries. This script intentionally cannot restore over the application database.

For hosting, configure encrypted daily backups and point-in-time recovery if available, a restricted off-site copy, retention and access policies, and a recurring isolated restore. Agree recovery objectives and record actual recovery timing before launch. Database backups include private photos; treat them as personal data. Local drill success does not verify the host's backups.

## Rollback

Keep the previous tested application artifact. Migrations in this change are additive. If application validation fails, close request intake using the administrator settings, stop new writes, and redeploy the previous compatible artifact. Do not blindly reverse/drop financial, audit, or upload tables. For an incompatible database incident, restore a pre-migration backup into a separate database, reconcile any accepted writes, and switch the application only after validation. Record the operator, time, release, and reconciliation outcome.

## Launch evidence still required

- Hosting/domain, HTTPS, real SMTP, verified first administrator, monitoring/support ownership.
- Browser checks at 360, 768, 1280, and 1920 pixels; keyboard focus/menu/forms; screen-reader status feedback; client-side errors/retries; real customer-to-technician-to-invoice journey. No browser session was available during implementation.
- Agreed service boundaries, technician evidence and commercial engagement, invoice issuer, currencies/taxes/fees/commission/refunds, cancellation/handover/dispute rules, privacy and retention policies. Configure approved values; do not treat demonstration values as commercial terms.
- A small authorized real-world pilot with actual operators, agreed scope, completion confirmation, correct invoice and receipt reconciliation, support response, and documented go/no-go decision.
- Keep noindex until the operational owner has made that launch decision. A green build or an available request form is not proof of real technician capacity or a completed launch.

## Photo retention scheduling

After validating a preview with `npx tsx scripts/cleanup-job-photos.ts`, schedule `npx tsx scripts/cleanup-job-photos.ts --apply` at the host (for example hourly). Alert on nonzero exits and retain the aggregate result. The command rechecks completion, the full three-day window, photo age, unresolved complaints, pending refunds, rework and manual retention holds under a job lock. It does not delete identity verification evidence or financial records. Configure backup expiry separately, preserve required holds, and run retention review after restoration before reopening access. No deletion schedule has been installed locally.
