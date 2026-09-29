# FallsFix

FallsFix is a planned local property-maintenance and service-management business, initially serving Victoria Falls, Zimbabwe. It will coordinate customers, verified technicians, service requests, quotations, invoices, and payment records.

**Current stage: Phase 6 — authentication, server-side role/ownership checks, and protected workspace entry pages implemented. Operational dashboards and bookings remain planned; browser and SMTP verification remain pending.** See [working progress](docs/progress.md) and [authorization](docs/authorization.md).

## Problem

Customers need a dependable way to find suitable technicians and follow repairs through to completion. FallsFix aims to replace disconnected calls and messages with an accountable service process.

## Proposed solution

A mobile-first public website and three protected portals will connect customer requests with administrator-managed technician assignments. Each job will retain its status history, agreed scope, financial records, and customer feedback.

## Business model

Proposed income sources are configurable call-out/service fees and technician commissions. Business maintenance subscriptions are a future option. Prices, commission rates, cancellation terms, and commercial responsibilities have not been agreed.

## User roles

- **Customer:** request services, approve quotations, track work, confirm completion, access invoices, and review completed jobs.
- **Technician:** manage their profile and assigned work, record progress, and submit completion evidence.
- **Administrator:** manage service operations, technician verification, assignments, quotations, invoices, payment records, and complaints.

## Core workflow

Request → review → assignment → acceptance → assessment → quotation when required → customer approval → scheduling → travel → arrival → work → technician completion → customer confirmation → invoice → payment recording → optional review → closure.

Exceptions and separate job, quote, invoice, and payment states are defined in the [Phase 0 specification](docs/phase-0-specification.md) and [business rules](docs/business-rules.md).

## Features and status

### Implemented

- Phase 0 planning documents.
- Next.js App Router with React, strict TypeScript, Tailwind CSS, shared layout, and custom 404.
- Public Home, Services, How It Works, About, Become a Technician, and Contact pages.
- Owner-provided phone/email links and operating hours: Monday–Friday and Sunday, 08:00–17:00 CAT; Saturday closed.
- Service catalogue search/group filters, mobile navigation, FAQs, loading/error states, and category previews.
- Request Service, Login, and Register availability pages; no submissions or authentication yet.
- HTTP smoke tests for public routes, links, category previews, and 404 handling.
- PostgreSQL core schema, versioned migration, inactive reference-data seed, server-only database entry point, and isolated database integration tests.
- Pinned dependencies, lockfile, lint/type-check/build commands, and basic response security headers.
- Local Git repository on `main`, ignore rules, consistent text/editor settings, and a recorded Node version.
- Verified local Git, Node.js, and npm commands; [development guide](docs/development.md).

### In progress

- Business validation of the proposed MVP and operating policies.

### Planned

- Customer, technician, and administrator portals and operational public forms.
- Authentication, server-side role and record ownership checks.
- Service requests, assignment, status history, and restricted photo uploads.
- Quotations, invoices, manual payment records, in-app notifications, and reviews.
- Operational reporting based on stored business records.

## Proposed technology and architecture

TypeScript and Next.js will support the website, portals, and server operations in one application. React will provide UI components; Tailwind CSS will support consistent responsive styling. PostgreSQL will store relational business records, accessed through Prisma. Zod will validate inputs. An established authentication solution will manage credentials and sessions; its selection is deferred until compatibility is evaluated during implementation. Private object storage will hold job photos.

Next.js, React, TypeScript, Tailwind CSS, PostCSS, and ESLint power the site. Prisma ORM 7 with its PostgreSQL adapter and `pg` provides typed database access; dotenv loads CLI configuration, tsx runs TypeScript scripts/tests, and `server-only` protects the application database entry point from client imports. Runtime validation, authentication, storage, and component-library choices remain planned. See the [current architecture](docs/architecture.md) and [future architecture concept](docs/phase-0-specification.md#14-initial-system-architecture-concept). Exact dependencies are recorded in `package.json` and `package-lock.json`.

## Database

The initial PostgreSQL schema covers users/roles, profiles, service categories/areas, technician eligibility, jobs/location snapshots, assignments, appointments, notes, and status history. A checked-in SQL migration adds keys, indexes, and integrity constraints. Financial, upload, notification, and authentication-provider tables are deferred to their feature phases. See [database design and setup](docs/database.md).

## Current project structure

```text
README.md                         Project overview and truthful implementation status
AGENTS.md                         Next.js-generated development guidance
CLAUDE.md                         Reference to the shared agent guidance
.gitignore                        Local secrets and generated-file exclusions
.gitattributes                    Cross-platform text normalization
.editorconfig                     Shared editor conventions
.node-version                     Observed development Node.js version
.env.example                      Database placeholders and optional test settings
package.json                      Dependencies and npm scripts
package-lock.json                 Reproducible dependency tree
next.config.ts                    Framework settings and response headers
tsconfig.json                     Strict TypeScript settings
eslint.config.mjs                 Next.js and TypeScript lint rules
postcss.config.mjs                Tailwind build integration
prisma.config.ts                  Migration, datasource and seed configuration
src/
  app/                            Next.js routing and shared document
    (public)/                     Public website pages
    (auth)/                       Login, registration, verification and recovery
    (portal)/                     Protected account and role workspaces
    api/                          Thin HTTP route handlers
  frontend/
    components/                   Reusable UI and browser interactions
    styles/                       Tailwind and global styles
  backend/
    auth/                         Authentication and email delivery
    authorization/                Role and ownership policies
    database/                     Database connection and test safety guard
  shared/
    data/                         Editorial service catalogue shared with seeding
    validation/                   Client/server input schemas
prisma/                           Database schema, SQL migrations and reference seed
tests/                            HTTP, authentication, permissions and database tests
scripts/                          Local setup and test-database preparation
docs/                             Architecture, setup, policies and progress
```

## Getting started

Use Node.js `24.16.0` (recorded in `.node-version`), npm `11.13.0`, and Git. From the repository directory:

```powershell
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. Stop with Ctrl+C; use `npm run dev -- --port 3001` if port 3000 is occupied. The public information pages still work without a running database. An `origin` remote is now configured in this checkout. See the [development guide](docs/development.md).

For database development on Windows with PostgreSQL 18 installed:

```powershell
./scripts/start-local-db.ps1
npm run db:generate
npm run db:deploy
npm run db:seed
npm run test:database
```

The helper generates ignored local credentials and separate development, shadow, and test databases on loopback port 55433. It does not overwrite an existing `.env`. See [database setup](docs/database.md) for alternative paths, existing PostgreSQL servers, stopping/restarting the cluster, and environment configuration. Never point shadow/test URLs at the application database.

For customer accounts, run `npm run auth:setup`, then `npm run dev` and open `/register`. Follow the verification link in the matching private `.local/auth-mail` file before logging in. Development emails are captured locally, not delivered. Read [authentication setup and production requirements](docs/authentication.md), including how to configure SMTP and the trusted proxy. Keep `BETTER_AUTH_URL` consistent with your exact browser origin. Production mode refuses local file delivery.

## Environment variables and scripts

Public pages require no environment values. Database operations use `DATABASE_URL`; migration development uses a separate `SHADOW_DATABASE_URL`; integration tests use `TEST_DATABASE_URL` pointing to a dedicated `fallsfix_test` database. Optional `TEST_BASE_URL` selects the HTTP test server (default `http://127.0.0.1:3100`). `.env.example` contains placeholders; the Windows setup helper creates actual `.env` values locally. Never commit secrets or put them in browser-visible `NEXT_PUBLIC_*` values.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dependencies |
| `npm run dev` | Start local development server |
| `npm run lint` | ESLint with zero warnings allowed |
| `npm run typecheck` | Generate Prisma/route types and run strict TypeScript checks |
| `npm run check` | Run lint and type checks |
| `npm run build` | Generate Prisma client and create the production build |
| `npm start` | Serve the existing production build locally |
| `npm run test:smoke` | Check public routes on a running server (port 3100 by default) |
| `npm run db:generate` / `db:validate` | Generate client types / validate schema |
| `npm run db:deploy` / `db:status` | Apply committed migrations / inspect their status |
| `npm run db:migrate -- --name change_name` | Create/apply a development migration using the shadow database |
| `npm run db:seed` | Add reference categories/area without overwriting edits |
| `npm run test:database` | Migrate the separate test DB and run transactional integrity tests |
| `npm run auth:setup` | Generate missing private local auth settings without displaying secrets |
| `npm run test:auth` | Test real auth handlers, cookies, recovery, rate limits, and security boundaries in the test DB |
| `npm run test:auth:http` | Start an isolated Next dev server/test DB and verify the account flow over HTTP; stop your dev server first |
| `npm run test:authorization` | Verify role isolation, job ownership, technician assignment access, and revocation |

## Testing and security

Run `npm run check`, `npm run test:auth`, `npm run test:database`, and `npm run test:auth:http` with no development server running, then `npm run build`. Start `npm start -- --port 3100` and run `npm run test:smoke` in another terminal. Production previews of public pages need no SMTP, but account APIs remain unavailable until production configuration is complete. Tests never reset/drop a database. HTTP tests do not execute client-side forms, filters, or mobile navigation. Browser verification remains pending; see [public website verification](docs/public-website.md) and [authentication verification](docs/authentication.md#verification).

Database/auth entry points are server-only. Better Auth handles passwords and sessions; Zod validates account inputs. Customer-only signup, verification, CSRF checks, rate limits, suspension checks, role guards, and job-read ownership policies are implemented. Uploads, business auditing, mutation-specific permissions, and production hardening remain planned. Secrets/local files stay ignored. Production needs a least-privilege runtime database role. Prelaunch noindex is not access control. See [authorization](docs/authorization.md) and [dependency maintenance notes](docs/development.md#dependency-maintenance-note).

## API and deployment

Account APIs are documented in [authentication](docs/authentication.md#api-surface); no deployed environment is configured by this project. Run `npm run build` then `npm start` for a local production preview. Enabling production accounts requires HTTPS, SMTP, a trusted proxy/IP header, production secrets/database access, and delivery verification. Hosted deployment also requires monitoring, backups, and end-to-end checks.

## Roadmap

- [x] Produce Phase 0 specification and completion checklist.
- [ ] Validate proposed commercial and operational policies with the business owner.
- [x] Phase 1: Local Git repository and development environment.
- [x] Phase 2: Next.js foundation (visual browser verification remains unavailable).
- [ ] Phase 3: Public website — implemented; browser interaction and responsive visual verification pending.
- [x] Phase 4: PostgreSQL/Prisma core schema, migration, reference seed, and database integrity tests.
- [x] Phase 5: Customer authentication implementation and server integration tests.
- [ ] Phase 5 release verification: browser interactions, actual SMTP delivery, and staging deployment checks.
- [x] Phase 6: Role/ownership read authorization and protected role routing; mutation policies arrive with their workflows.
- [ ] Phases 7–12: Portals, job workflow/history, and uploads.
- [ ] Phases 13–16: Quotations, invoices/payment records, notifications, and reviews.
- [ ] Phases 17–21: Reporting, hardening, expanded tests, deployment, and launch validation.

The specification contains the full phase-by-phase roadmap. Security and testing begin with the first applicable feature, even though later phases provide dedicated verification.

## Contributing

Use small feature branches and descriptive commits, with checks and documentation alongside changes. Phase 6 uses `feature/role-authorization`, based on `feature/customer-authentication`. An origin remote exists; this phase does not push or deploy changes. See the [Git workflow](docs/development.md#repository-conventions). Phase 7 adds the customer portal; browser and SMTP checks remain tracked separately.

## License

No license has been selected. Publishing code on GitHub does not itself grant a general open-source license. A permissive license would allow broad reuse; a copyleft license would impose sharing obligations in specified circumstances. The owner should choose the intended reuse terms before release. This document grants no license.

Screenshots will be added when a real interface exists.
