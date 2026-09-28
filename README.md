# FallsFix

FallsFix is a planned local property-maintenance and service-management business, initially serving Victoria Falls, Zimbabwe. It will coordinate customers, verified technicians, service requests, quotations, invoices, and payment records.

**Current stage: Phase 4 — PostgreSQL and Prisma database foundation. Public-site browser verification remains pending; booking, authentication, and business operations are not implemented.**

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
app/
  layout.tsx                      Shared document, header and footer
  page.tsx                        Public homepage
  services/, how-it-works/         Catalogue and process pages
  about/, become-a-technician/     Business and technician information
  contact/                        Phone/email links and operating hours
  request-service/                Category preview; no booking submission
  login/, register/               Account availability; no authentication
  loading.tsx, error.tsx           Route loading and retry states
  icon.svg                        Local favicon
  not-found.tsx                   Unknown-route page
  globals.css                     Tailwind and shared styles
components/                       Shared public UI and interactive catalogue/navigation
data/services.ts                  Planned editorial categories; not operational availability
tests/public-site.test.mjs         HTTP smoke tests against a running server
tests/database.test.ts            Isolated PostgreSQL integrity tests
lib/database/                     Server database entry point, client factory and test guard
prisma/                           Relational schema, SQL migration and reference seed
scripts/                          Local PostgreSQL setup and test-database preparation
docs/
  phase-0-specification.md         Requirements, scope, workflows, architecture, roadmap
  business-rules.md                Proposed central operating and authorization policies
  development.md                  Verified tools, local setup and Git workflow
  architecture.md                 Implemented application architecture
  public-website.md               Public routes, content limits and verification
  database.md                     Database model, setup, commands and security boundaries
```

## Getting started

Use Node.js `24.16.0` (recorded in `.node-version`), npm `11.13.0`, and Git. From the repository directory:

```powershell
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. Stop with Ctrl+C; use `npm run dev -- --port 3001` if port 3000 is occupied. The public pages still work without a running database. No remote is configured; an actual clone URL will be added after publication. See the [development guide](docs/development.md).

For database development on Windows with PostgreSQL 18 installed:

```powershell
./scripts/start-local-db.ps1
npm run db:generate
npm run db:deploy
npm run db:seed
npm run test:database
```

The helper generates ignored local credentials and separate development, shadow, and test databases on loopback port 55433. It does not overwrite an existing `.env`. See [database setup](docs/database.md) for alternative paths, existing PostgreSQL servers, stopping/restarting the cluster, and environment configuration. Never point shadow/test URLs at the application database.

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

## Testing and security

Run `npm run check` and `npm run build`, then start `npm start -- --port 3100`. In another terminal, run `npm run test:smoke`. Database changes also require `npm run test:database`; its fixtures roll back and never reset/drop a database. HTTP tests do not execute client-side filters or mobile navigation. Browser verification remains pending; see [public website verification](docs/public-website.md). Database tests validate integrity, not unimplemented authentication/RBAC or complete business workflows.

Basic response headers are configured, local servers bind to loopback, and the database entry point is server-only. Generated credentials/local database files remain ignored. The local migration role is not a cluster administrator; production still needs a separate least-privilege runtime role. Authentication, authorization, ownership checks, uploads, runtime validation, sessions, auditing, and rate limiting remain planned. Prelaunch noindex is not access control. Patched transitive dependency overrides and the existing ESLint support limitation are explained in [development notes](docs/development.md#dependency-maintenance-note).

## API and deployment

No API or deployed environment exists. Run `npm run build` then `npm start` for a local production server. Hosted deployment still requires appropriate network binding, HTTPS, monitoring, and later database/storage/backup and end-to-end checks. API contracts will be documented as implemented.

## Roadmap

- [x] Produce Phase 0 specification and completion checklist.
- [ ] Validate proposed commercial and operational policies with the business owner.
- [x] Phase 1: Local Git repository and development environment.
- [x] Phase 2: Next.js foundation (visual browser verification remains unavailable).
- [ ] Phase 3: Public website — implemented; browser interaction and responsive visual verification pending.
- [x] Phase 4: PostgreSQL/Prisma core schema, migration, reference seed, and database integrity tests.
- [ ] Phases 5–6: Authentication and RBAC.
- [ ] Phases 7–12: Portals, job workflow/history, and uploads.
- [ ] Phases 13–16: Quotations, invoices/payment records, notifications, and reviews.
- [ ] Phases 17–21: Reporting, hardening, expanded tests, deployment, and launch validation.

The specification contains the full phase-by-phase roadmap. Security and testing begin with the first applicable feature, even though later phases provide dedicated verification.

## Contributing

Use small feature branches and descriptive commits, with checks and documentation updates alongside each change. Phase 4 uses `feature/database-foundation`, based on the public-website branch. See the [Git workflow](docs/development.md#repository-conventions). GitHub publishing remains pending. Phase 5 will select and implement established authentication; the outstanding browser checks remain tracked separately.

## License

No license has been selected. Publishing code on GitHub does not itself grant a general open-source license. A permissive license would allow broad reuse; a copyleft license would impose sharing obligations in specified circumstances. The owner should choose the intended reuse terms before release. This document grants no license.

Screenshots will be added when a real interface exists.
