# Working progress

- User authorized continuing across all phases without further phase approvals. This supersedes the former stop-at-phase-boundary note. Keep updates concise; do not use subagents.
- Development now includes the customer/administrator/technician workflows through core phase 17 functionality: persisted requests, profiles, assignments/history, private photos, quote drafts/revisions/decisions, invoice snapshots, manual receipts/reversals, notifications, reviews/complaints, and real-data reports.
- Request a Service now opens a real form and saves an owned request/reference for verified customers. Categories can receive requests for review while assignment remains blocked until administrator activation confirms coverage. Request intake is configurable.
- Owner-supplied logo is shared across pages, icons, invoice representation and social metadata. Twelve generated, locally stored service illustrations are wired into the catalogue/home cards.
- Phase 18-19 checks cover authorization, transactions, concurrent/stale edits, price approval, receipt retries, uploads, account HTTP flow, and public routes. Browser runtime returned no available sessions; interactive/visual/accessibility checks remain pending.
- Phase 20 preparation includes CI configuration, production build, /api/health, release configuration check, administrator bootstrap command, and a successful local backup/restore drill. No host/domain or live SMTP is configured; release:check correctly fails those missing production prerequisites.
- Phase 21 requires an actual operator pilot and agreed commercial/privacy/support details. Do not mark deployment or launch complete from local tests.
- Current implementation and deliberate policy boundaries: docs/operations.md. Release/backup/rollback/launch instructions: docs/deployment.md. Image prompts: docs/service-images.md.
- No push, commit, public deployment, real privileged account creation, or external notification was performed. Await the intended administrator email and hosting/domain details requested asynchronously while continuing independent local work.

## Latest local verification (2026-09-29)

- Lint and TypeScript checks passed.
- 29 database, authentication, authorization and operational tests passed.
- One authenticated HTTP scenario passed, covering sessions, requests and private photos.
- Four public-route/navigation smoke tests passed against the production server.
- All 17 service/logo/icon/social image endpoints returned image responses successfully.
- All six database migrations are applied. A fresh local backup restored successfully with matching checked table counts.
- Production build passed. Interactive browser checks, hosted delivery, deployment and operator acceptance remain pending as described above.

## Owner policy decisions received

See [owner decisions](owner-decisions.md) for the supplied policies and unresolved calculation details. The intended administrator is now known; hosting/domain details remain outstanding. Bootstrap found and fixed a PostgreSQL void-result decoding issue, covered by a new passing role/suspension regression test. The intended owner account must be registered and verified before provisioning. No administrator was granted. Invoice identity and IT-only coverage can then be applied with `npx tsx scripts/apply-owner-settings.ts`; this prepared script has not changed live settings. Seven operational tests passed after the fix. Policy-dependent work and browser acceptance remain open; earlier test totals are historical.

## Confirmed owner policy implementation (2026-09-30)

The confirmed rules in [owner-decisions.md](owner-decisions.md) supersede the preliminary unresolved policy notes above. Implemented: structured technician review evidence, typed pricing with labour-only 75/25 allocation, explicit customer-approved call-out before dispatch, 14-day quote validity, eligible-receipt-based 65% settlement refunds, separate refund disbursement, completion-notified three-day rework, retention holds and guarded cleanup, and expanded immutable invoice snapshots with optional legal identifiers. The invoice identity/IT-only coverage script remains unexecuted, as requested; no administrator account was provisioned.

Identity/profile-photo review uses administrator-recorded private evidence references, not a new identity upload vault. Financial records are manual; payout reconciliation remains operational. Cleanup defaults to dry-run and still needs a production schedule and backup-expiry policy. Legacy documents remain unchanged; legacy completion dates are not invented. Browser discovery again returned no available sessions.

### Verification after confirmed policy changes

- 35 authentication, authorization, database and operational tests passed, including 12 operational tests.
- Authenticated HTTP test passed, including printable invoice fields, omission of blank legal IDs and anonymous invoice denial.
- Four public route/navigation smoke tests passed against the fresh production preview: 40 automated checks in total.
- Lint, TypeScript and production build passed. Test-server generated types are excluded from the ordinary project scan to avoid cross-server type-file conflicts; run HTTP tests and production builds sequentially because Next also regenerates next-env.d.ts.
- Eight migrations applied to development/test databases. Backup/restore drill passed, including the refund table.
- Photo cleanup dry-run returned zero eligible photos. No deletion mode, administrator provisioning, prepared invoice identity, IT-only coverage activation or hosted deployment was performed.
- Interactive browser acceptance remains pending: no browser sessions are available. Original identity/photo review and refund-related technician payout reconciliation remain operator tasks.
