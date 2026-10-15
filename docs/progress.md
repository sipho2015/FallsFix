# Working progress

## Frontend project root (2026-10-15)

Moved root `src` and `public` into `frontend/src` and `frontend/public` at the owner's request. `frontend` is now the Next.js project directory, containing Next.js, PostCSS, app TypeScript and Vercel configuration plus a private npm workspace package. Root npm dev/build/start/typegen commands explicitly target it, while root lint/TypeScript/database/operator commands still cover the repository. Root `.env` remains private and is loaded by frontend configuration. Turbopack and output tracing use the repository root so backend/database imports are included. Updated authenticated HTTP server launch and path documentation.

Vercel must use Root Directory **frontend**, include source files outside that directory, and read `frontend/vercel.json`. The install/build commands call the root workspace from there. Root `src` and `public` no longer exist; this is a physical move, not just an Explorer exclusion. Lockfile was updated for the frontend workspace; a frozen-install dry-run passed. Lint, TypeScript, authenticated HTTP verification, production build and all four public smoke tests passed. Updated local preview runs at http://127.0.0.1:3102; no hosted settings or deployments were changed.

The production health probe caught Next.js caching its initial environment before loading root `.env`; frontend configuration now explicitly reloads the root environment while retaining inherited deployment/test variables. Repeated lint/TypeScript, authenticated HTTP, build and public smoke verification passed after this fix. All 17 image endpoints passed and database health returned 200. The earlier root-directory preview was stopped.

## Repository organization (2026-10-15)

Grouped source into `frontend/`, `backend/`, `database/`, `vercel/` and `.github/`. Frontend owns components/styles/shared browser-safe schemas and smoke tests; backend owns auth/authorization/operations, operator scripts and integration tests; database owns Prisma schema/migrations/seed, client, local database/backup/test scripts, integrity tests and generated client. Vercel owns the release-check script; GitHub retains its required workflow location. Updated imports, aliases, Prisma config, npm commands, lint rules and documentation; package dependencies and database schema are unchanged.

Next.js still discovers routes/API entry points under `frontend/src/app` and static assets under `public`; root npm/framework/Prisma/Vercel configuration remains in its required location. Shared documentation remains under `docs`. Added folder guides and shared VS Code Explorer exclusions/nesting to hide dependencies, build output, generated code, private `.local` storage and generated type files. Runtime data, backups and credentials were preserved. Automatic approval review blocked cache deletion (including an explicit retry for the two obsolete preview/test output directories), reporting only "blocked by policy"; those files remain hidden rather than being removed.

Lint, TypeScript, Prisma validation, all 35 database/authentication/authorization/operational tests, the authenticated HTTP scenario, production build, four public smoke tests and the relocated backup/restore drill passed. All npm script file references exist and Git whitespace checks pass. Release check still intentionally rejects local development settings. Local production preview is running at http://127.0.0.1:3100; stop it before rebuilding in the same checkout. No commit, push or hosted deployment is part of this reorganization.

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

See [owner decisions](owner-decisions.md) for the supplied policies and unresolved calculation details. The intended administrator is now known; hosting/domain details remain outstanding. Bootstrap found and fixed a PostgreSQL void-result decoding issue, covered by a new passing role/suspension regression test. The intended owner account must be registered and verified before provisioning. No administrator was granted. Invoice identity and IT-only coverage can then be applied with `npx tsx backend/scripts/apply-owner-settings.ts`; this prepared script has not changed live settings. Seven operational tests passed after the fix. Policy-dependent work and browser acceptance remain open; earlier test totals are historical.

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

## Administrator workspace redesign (2026-09-30)

Replaced the single long administrator screen with an overview and focused URL-addressable sections: requests, people, service coverage, reports, notifications, activity, settings and profile. Desktop uses a branded sidebar; narrow screens use horizontally scrollable navigation with account access retained. Overview cards use actual stored counts, requests use a compact table, verification forms are expandable, and settings show current values before opening an editor. Search/report submissions preserve their active section. Existing permissions and operation handlers are unchanged.

Authenticated HTTP checks passed for every administrator section, overview/form separation, retained filter navigation, existing account permissions and invoices. Interactive visual inspection is still pending because browser discovery returned no connected sessions.

## Account landing layout

Replaced the oversized welcome/notice block and bare workspace links with a compact identity strip, verified-email badge and role-specific workspace cards. Administrator appears first for authorized users; existing role checks still determine which cards are shown. Sign-out remains the existing action, separated into its own footer area. Layout and email wrapping adapt to small screens.

## Developer continuation (2026-10-10)

Completed the unfinished customer workspace styling: responsive overview, request cards, status totals, updates, profile and technician application sections. Fixed a Prisma groupBy contextual typing failure and ignored stale pagination on overview screens so recent requests stay recent. Added authenticated HTTP coverage for customer sections and the stale-page regression alongside the administrator section checks.

Updated Next.js and eslint-config-next from 16.3.6 to 16.3.8 and source-map-js to 1.2.2. Production dependency audit reports zero vulnerabilities; CI now rejects high/critical production dependency findings. Full audit still reports five high-severity entries in the unpatched development-only braces dependency chain; see [development notes](development.md#dependency-review-2026-10-10). PostgreSQL tests also emit an adapter query-concurrency deprecation warning; current pinned pg 8 tests pass, but review adapter compatibility before any pg 9 upgrade.

Release checking now validates a PostgreSQL database URL and requires SITE_URL to match the canonical authentication origin. Synthetic complete configuration passes; mismatched origin and invalid database configuration are rejected. Local configuration still correctly fails the production gate for missing HTTPS/SMTP/proxy configuration.

### Verification

- Lint and TypeScript passed on the patched framework.
- 35 database/authentication/authorization/operational tests passed. Authenticated HTTP scenario passed again after the framework update, covering all customer/admin sections, access denial, request retries, private uploads and printable invoices.
- Production build passed on Next.js 16.3.8. All four public smoke tests passed against that build: 40 automated checks overall.
- All 17 service/logo/icon/social image endpoints returned image responses; /api/health returned 200.
- Eight test migrations are applied. Restarted the existing local PostgreSQL cluster; backup/isolated restore passed with matching checked table counts, and photo cleanup dry-run found zero eligible photos.
- Release configuration's positive and negative synthetic checks passed. Git whitespace check passed.

### Remaining external acceptance

Browser connection still reports no available browser, so visual, keyboard, screen-reader and interactive retry acceptance remain unverified. [Acceptance checklist](acceptance.md) now provides screen/viewport, synthetic workflow, financial reconciliation and hosted acceptance steps. Hosting/domain/SMTP provider details and intended-owner registration/verification status were requested; no production configuration is invented.

No administrator was provisioned, owner settings/IT-only coverage were not applied, no photos were deleted, and no commit, push or hosted deployment was performed. Current changes remain local and uncommitted. Production preview was started at http://127.0.0.1:3100 for smoke verification; it uses the development database, retains noindex, and is not a live launch. Stop this preview before rebuilding in the same checkout.

## Vercel preparation (2026-10-10)

Owner supplied Vercel, fallsfix.com and siphomoyo893@gmail.com. Added [Vercel deployment instructions](vercel.md) and vercel.json with Next.js detection, locked install and a release-check-before-build gate. Production origins are documented as https://fallsfix.com; local environment values remain local. Vercel project/account access, domain DNS, hosted PostgreSQL and SMTP provider/credentials remain unconfirmed. The email address is recorded as the administrator; whether it is also the mail sender and whether the account is registered/verified were requested separately.

Reduced the shared client/request-reader/image-decoder photo limit to 4 MiB (displayed as 4 MB), below Vercel's 4.5 MB function payload ceiling. Updated operational/deployment documentation and the oversized-photo regression. Lint, TypeScript, all 12 operational tests, Vercel JSON validation and whitespace checks passed. Interactive/hosted checks, administrator provisioning and retention scheduling remain pending. No linked Vercel project or installed Vercel CLI was found. The earlier local production preview was stopped for rebuilding.

Authenticated HTTP verification and the refreshed production build also passed after the Vercel preparation changes. The local preview remains stopped; no deployment was attempted without project access and the required production services.

Owner follow-up confirmed that no Vercel project or hosted PostgreSQL database exists yet and the intended owner account is not registered/verified. SMTP provider choice and domain ownership/DNS remain outstanding. Next external steps: create/connect the owner's Vercel project, provision hosted PostgreSQL, configure private production variables and mail delivery, deploy for acceptance, then register/verify the owner before audited administrator provisioning.

## First hosted inspection (2026-10-10)

Owner reported Vercel Ready at https://falls-fix.vercel.app. Read-only HTTP inspection confirmed the homepage and services return 200, but login/registration are "coming soon" pages without forms and the request-service page has no form. /api/health and /portal/admin return 404. This is an earlier public-site build, not the current local workflow implementation. The local work remains uncommitted/unpushed; check Vercel's connected repository, branch and deployed commit before updating it. Hosted database/mail configuration and intended-owner verification remain unconfirmed. No hosted writes, registration, administrator provisioning or deployment changes were performed.
