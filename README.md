# FallsFix

FallsFix coordinates local service requests in Victoria Falls, Zimbabwe. The application includes the public website and protected customer, technician, and administrator workspaces.

## Project folders

| Area | Contents |
| --- | --- |
| [frontend](frontend/README.md) | Interface components, styles, browser-safe shared schemas and public smoke tests |
| [backend](backend/README.md) | Authentication, permissions, business workflows, operator scripts and integration tests |
| [database](database/README.md) | Prisma schema/migrations/seed, database client, database scripts/tests and generated client |
| [vercel](vercel/README.md) | Production release checks and hosting guidance |
| [.github](.github/README.md) | GitHub automation |

`frontend/src/app` holds Next.js routes and API entry points; `frontend/public` holds public assets. Next.js/PostCSS/Vercel configuration lives inside `frontend`; root npm, TypeScript, lint and Prisma configuration coordinates the complete application. `docs` holds shared business and operational documentation. This is one integrated application, not five separate deployable services. Run npm commands from the repository root; existing command names are unchanged. Vercel's project Root Directory must now be **frontend**, with files outside that directory included in the build.

VS Code hides generated output, dependencies and private `.local` storage using the checked-in Explorer settings. The local database, backups and credentials are preserved. Build caches can be regenerated and are not source code.

## Implemented

- Owner-supplied logo throughout the site, application icons, and social previews; twelve illustrated service categories.
- Verified customer accounts, service requests, role and ownership checks, technician applications and verification.
- Assignment, appointment scheduling, progress history, approved quote revisions, completion confirmation, and complaints.
- Printable invoices, manual payment receipts and reversals, private job photos, notifications, reviews, and operational reports.
- Database migrations, automated integration checks, CI configuration, and local backup/restore tooling.

This is a development implementation, not a deployed or approved live service. Production hosting, domain, verified administrator identity, SMTP delivery, browser verification, and a real pilot remain launch requirements. Owner-confirmed commercial policies are implemented; operator acceptance and remaining privacy/support arrangements are required before live operation. See [progress](docs/progress.md), [operations](docs/operations.md), and [deployment](docs/deployment.md).

## Development

Use Node 24.16 or later within version 24 and npm 11.13. Copy `.env.example` to a private `.env` and configure PostgreSQL and authentication. Never commit credentials.

```sh
npm ci
npm run db:deploy
npm run db:seed
npm run dev
```

Seeded categories require administrator activation before technician assignment. Requests can be submitted for review before activation. See [development setup](docs/development.md) and [authentication](docs/authentication.md).

## Validation

```sh
npm run check
npm run test:database
npm run test:authorization
npm run test:auth
npm run test:operations
npm run test:auth:http
npm run build
```

Tests use a separate local database. Run the database suites sequentially, then the HTTP suite before the production build: Next.js regenerates shared type files. Public smoke tests require a running server and `TEST_BASE_URL`. Production configuration is checked with `npm run release:check`, including the canonical site/authentication origin and PostgreSQL URL; local development settings intentionally fail that gate.

## Project references

- [Phase specification](docs/phase-0-specification.md)
- [Business rules](docs/business-rules.md)
- [Authorization](docs/authorization.md)
- [Public website](docs/public-website.md)
- [Service image assets and prompts](docs/service-images.md)

Next.js 16, React 19, TypeScript, Prisma 7, PostgreSQL, Better Auth, and Zod power the application. Job photos are normalized and stored privately in PostgreSQL; hosting storage and retention must be sized for production use.

Owner-confirmed commercial policy and implementation details: [owner decisions](docs/owner-decisions.md). Prepared invoice identity and IT-only coverage remain pending the verified administrator account. Photo cleanup is available as a guarded dry-run/apply command; production scheduling is still required.
