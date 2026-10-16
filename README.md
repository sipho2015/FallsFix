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

`frontend/src/app` holds pages and the public `/api/*` proxy; `frontend/public` holds public assets. `backend/src/app/api` holds the actual API handlers. The root `vercel.json` deploys two Next.js services: public `frontend` and internal `backend`. The frontend calls the backend through Vercel's runtime `BACKEND_URL` binding; browser URLs remain unchanged. Server-rendered pages still import the shared backend/database modules directly. PostgreSQL is an external managed database, not a Vercel service. `docs` holds shared business and operational documentation.

Run npm commands from the repository root. Vercel's project Root Directory must be the **repository root (`.`)** so it reads the root services configuration. This supersedes the previous `frontend` Root Directory setting. See [Vercel setup](docs/vercel.md).

VS Code hides generated output, dependencies and private `.local` storage using the checked-in Explorer settings. The local database, backups and credentials are preserved. Build caches can be regenerated and are not source code.

## Implemented

- Owner-supplied logo throughout the site, application icons and social previews; twelve service categories with locally stored, genuine stock photography and source credits.
- Verified customer accounts, service requests, role and ownership checks, technician applications and verification.
- Assignment, appointment scheduling, progress history, approved quote revisions, completion confirmation, and complaints.
- Printable invoices, manual payment receipts and reversals, private job photos, notifications, reviews, and operational reports.
- Database migrations, automated integration checks, CI configuration, and local backup/restore tooling.
- Completed service/process/contact/technician information, a technician-application entry point, and account/job-data guidance with photo credits.

This is a development implementation, not a deployed or approved live service. Production hosting, domain, verified administrator identity, SMTP delivery, browser verification, and a real pilot remain launch requirements. Owner-confirmed commercial policies are implemented; operator acceptance and remaining privacy/support arrangements are required before live operation. See [progress](docs/progress.md), [operations](docs/operations.md), and [deployment](docs/deployment.md).

## Development

Use Node 24.16 or later within version 24 and npm 11.13. Copy `.env.example` to a private `.env` and configure PostgreSQL and authentication. Never commit credentials.

```sh
npm ci
npm run db:deploy
npm run db:seed
npm run dev
```

`npm run dev` runs the pinned Vercel CLI with `vercel dev -L`, which starts both services and generates the binding automatically without account linking. The first run downloads the CLI if it is not cached. Open http://127.0.0.1:3000. Do not set `BACKEND_URL` manually. `dev:frontend` and `dev:backend` are service commands used by Vercel; running just the frontend does not start the API.

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

Tests use a separate local database. Run the database suites sequentially, then the HTTP suite before the production build: Next.js regenerates shared type files. The HTTP suite starts both services through `vercel dev -L`. `npm run build` builds both apps; Vercel builds each independently through `build:frontend` and `build:backend`. Public smoke tests require a running server and `TEST_BASE_URL`. `npm start` remains a frontend-only Next.js production diagnostic; use `npm run dev` to exercise both services locally. Production configuration is checked with `npm run release:check`, including the canonical site/authentication origin and PostgreSQL URL; local development settings intentionally fail that gate.

## Project references

- [Phase specification](docs/phase-0-specification.md)
- [Business rules](docs/business-rules.md)
- [Authorization](docs/authorization.md)
- [Public website](docs/public-website.md)
- [Service image assets and prompts](docs/service-images.md)
- [Current service photography and sources](docs/photography.md)

Next.js 16, React 19, TypeScript, Prisma 7, PostgreSQL, Better Auth, and Zod power the application. Job photos are normalized and stored privately in PostgreSQL; hosting storage and retention must be sized for production use.

Owner-confirmed commercial policy and implementation details: [owner decisions](docs/owner-decisions.md). Prepared invoice identity and IT-only coverage remain pending the verified administrator account. Photo cleanup is available as a guarded dry-run/apply command; production scheduling is still required.
