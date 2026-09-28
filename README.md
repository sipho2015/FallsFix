# FallsFix

FallsFix is a planned local property-maintenance and service-management business, initially serving Victoria Falls, Zimbabwe. It will coordinate customers, verified technicians, service requests, quotations, invoices, and payment records.

**Current stage: Phase 1 — local Git repository and development environment established. No application exists yet.**

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

- Phase 0 planning documents; no executable product features.
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

These are architectural intentions, not installed dependencies. See the [architecture concept](docs/phase-0-specification.md#14-initial-system-architecture-concept).

## Database

No database or migrations exist. The specification identifies candidate entities and relationships; Phase 4 will turn them into a reviewed schema with constraints and indexes.

## Current project structure

```text
README.md                         Project overview and truthful implementation status
.gitignore                        Local secrets and generated-file exclusions
.gitattributes                    Cross-platform text normalization
.editorconfig                     Shared editor conventions
.node-version                     Observed development Node.js version
docs/
  phase-0-specification.md         Requirements, scope, workflows, architecture, roadmap
  business-rules.md                Proposed central operating and authorization policies
  development.md                  Verified tools, local setup and Git workflow
```

## Getting started

Read this README, the specification, and the business rules. Follow the [development guide](docs/development.md) to inspect the local repository and tools. Phase 1 verified Git `2.55.0.windows.5`, Node.js `24.16.0`, and npm `11.13.0` on Windows PowerShell. `.node-version` records that Node baseline; application compatibility will be checked in Phase 2.

No remote is configured and there is no application to install or run. Actual clone instructions, dependencies, database setup, migrations, and application commands will be added when those steps exist and have been verified.

## Environment variables and scripts

None are currently required or defined. A `.env.example` containing variable names and safe placeholders will accompany the relevant implementation phase. Real secrets and `.env` files must never be committed.

## Testing and security

Phase 0 was validated by checking requirement coverage, workflow consistency, document links, and accurate status descriptions. Phase 1 checks cover installed tool commands, Git setup, ignore rules, documentation links, and whitespace. There is no application to lint, type-check, test, or build yet.

Planned security includes established authentication, server-side authorization, resource ownership checks, restricted uploads, validation, secure sessions, audit history, rate limiting, and protected secrets. These controls are requirements, not implemented guarantees.

## API and deployment

No API or deployed environment exists. API contracts will be documented as operations are implemented. Production deployment will require verified application configuration, database migrations, private storage, monitoring, backup restoration, and end-to-end acceptance tests.

## Roadmap

- [x] Produce Phase 0 specification and completion checklist.
- [ ] Validate proposed commercial and operational policies with the business owner.
- [x] Phase 1: Local Git repository and development environment.
- [ ] Phase 2: Next.js foundation.
- [ ] Phase 3: Public website.
- [ ] Phases 4–6: Database, authentication, and RBAC.
- [ ] Phases 7–12: Portals, job workflow/history, and uploads.
- [ ] Phases 13–16: Quotations, invoices/payment records, notifications, and reviews.
- [ ] Phases 17–21: Reporting, hardening, expanded tests, deployment, and launch validation.

The specification contains the full phase-by-phase roadmap. Security and testing begin with the first applicable feature, even though later phases provide dedicated verification.

## Contributing

Use small feature branches and descriptive commits, with checks and documentation updates alongside each change. The local repository uses `main`; see the [Git workflow](docs/development.md#repository-conventions). GitHub publishing and remote configuration remain pending. Phase 2 is the next application milestone.

## License

No license has been selected. Publishing code on GitHub does not itself grant a general open-source license. A permissive license would allow broad reuse; a copyleft license would impose sharing obligations in specified circumstances. The owner should choose the intended reuse terms before release. This document grants no license.

Screenshots will be added when a real interface exists.
