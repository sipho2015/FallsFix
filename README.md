# FallsFix

FallsFix is a planned local property-maintenance and service-management business, initially serving Victoria Falls, Zimbabwe. It will coordinate customers, verified technicians, service requests, quotations, invoices, and payment records.

**Current stage: Phase 2 — Next.js application foundation. The public website and business features remain planned.**

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
- Next.js App Router foundation with React, strict TypeScript, Tailwind CSS, a coming-soon page, shared layout, and custom 404.
- Pinned dependencies, lockfile, lint/type-check/build commands, and basic response security headers.
- Local Git repository on `main`, ignore rules, consistent text/editor settings, and a recorded Node version.
- Verified local Git, Node.js, and npm commands; [development guide](docs/development.md).

### In progress

- Business validation of the proposed MVP and operating policies.

### Planned

- Public website and customer, technician, and administrator portals.
- Authentication, server-side role and record ownership checks.
- Service requests, assignment, status history, and restricted photo uploads.
- Quotations, invoices, manual payment records, in-app notifications, and reviews.
- Operational reporting based on stored business records.

## Proposed technology and architecture

TypeScript and Next.js will support the website, portals, and server operations in one application. React will provide UI components; Tailwind CSS will support consistent responsive styling. PostgreSQL will store relational business records, accessed through Prisma. Zod will validate inputs. An established authentication solution will manage credentials and sessions; its selection is deferred until compatibility is evaluated during implementation. Private object storage will hold job photos.

Next.js, React, TypeScript, Tailwind CSS, PostCSS, and ESLint are installed. Database, runtime validation, authentication, storage, and component-library choices remain planned. See the [current architecture](docs/architecture.md) and [future architecture concept](docs/phase-0-specification.md#14-initial-system-architecture-concept). Exact dependencies are recorded in `package.json` and `package-lock.json`.

## Database

No database or migrations exist. The specification identifies candidate entities and relationships; Phase 4 will turn them into a reviewed schema with constraints and indexes.

## Current project structure

```text
README.md                         Project overview and truthful implementation status
AGENTS.md                         Next.js-generated development guidance
CLAUDE.md                         Reference to the shared agent guidance
.gitignore                        Local secrets and generated-file exclusions
.gitattributes                    Cross-platform text normalization
.editorconfig                     Shared editor conventions
.node-version                     Observed development Node.js version
.env.example                      No configuration required yet
package.json                      Dependencies and npm scripts
package-lock.json                 Reproducible dependency tree
next.config.ts                    Framework settings and response headers
tsconfig.json                     Strict TypeScript settings
eslint.config.mjs                 Next.js and TypeScript lint rules
postcss.config.mjs                Tailwind build integration
app/
  layout.tsx                      Shared document, header and footer
  page.tsx                        Prelaunch notice
  not-found.tsx                   Unknown-route page
  globals.css                     Tailwind and shared styles
docs/
  phase-0-specification.md         Requirements, scope, workflows, architecture, roadmap
  business-rules.md                Proposed central operating and authorization policies
  development.md                  Verified tools, local setup and Git workflow
  architecture.md                 Implemented application architecture
```

## Getting started

Use Node.js `24.16.0` (recorded in `.node-version`), npm `11.13.0`, and Git. From the repository directory:

```powershell
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. Stop with Ctrl+C; use `npm run dev -- --port 3001` if port 3000 is occupied. No database setup is required. No remote is configured; an actual clone URL will be added after publication. See the [development guide](docs/development.md).

## Environment variables and scripts

No environment variables are required; `.env.example` records this. Never commit secrets or put them in browser-visible `NEXT_PUBLIC_*` values.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dependencies |
| `npm run dev` | Start local development server |
| `npm run lint` | ESLint with zero warnings allowed |
| `npm run typecheck` | Generate route types and run strict TypeScript checks |
| `npm run check` | Run lint and type checks |
| `npm run build` | Create the production build |
| `npm start` | Serve the existing production build locally |

## Testing and security

Run `npm run check` and `npm run build` before committing application changes. Check the homepage and an unknown route on the running server. No automated business test suite exists yet; introduce meaningful tests with the first domain behavior. See the development guide for verification evidence and limitations.

Basic security response headers are configured, the framework-identification header is disabled, and local servers bind to loopback. Authentication, server-side authorization, ownership checks, uploads, runtime validation, sessions, auditing, and rate limiting remain planned. Prelaunch metadata requests no indexing; this is not access control.

## API and deployment

No API or deployed environment exists. Run `npm run build` then `npm start` for a local production server. Hosted deployment still requires appropriate network binding, HTTPS, monitoring, and later database/storage/backup and end-to-end checks. API contracts will be documented as implemented.

## Roadmap

- [x] Produce Phase 0 specification and completion checklist.
- [ ] Validate proposed commercial and operational policies with the business owner.
- [x] Phase 1: Local Git repository and development environment.
- [x] Phase 2: Next.js foundation (visual browser verification remains unavailable).
- [ ] Phase 3: Public website.
- [ ] Phases 4–6: Database, authentication, and RBAC.
- [ ] Phases 7–12: Portals, job workflow/history, and uploads.
- [ ] Phases 13–16: Quotations, invoices/payment records, notifications, and reviews.
- [ ] Phases 17–21: Reporting, hardening, expanded tests, deployment, and launch validation.

The specification contains the full phase-by-phase roadmap. Security and testing begin with the first applicable feature, even though later phases provide dedicated verification.

## Contributing

Use small feature branches and descriptive commits, with checks and documentation updates alongside each change. Phase 2 uses `feature/nextjs-foundation` off `main`; see the [Git workflow](docs/development.md#repository-conventions). GitHub publishing remains pending. Phase 3 is the public website.

## License

No license has been selected. Publishing code on GitHub does not itself grant a general open-source license. A permissive license would allow broad reuse; a copyleft license would impose sharing obligations in specified circumstances. The owner should choose the intended reuse terms before release. This document grants no license.

Screenshots will be added when a real interface exists.
