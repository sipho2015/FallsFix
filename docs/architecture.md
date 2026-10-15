# Application architecture

FallsFix is one Next.js application with public pages and protected customer, technician and administrator workspaces. Its backend implements authentication, service workflows, quotes, invoices, manual receipts/refunds, private photos, notifications, complaints and reporting. PostgreSQL is accessed through Prisma. See [operations](operations.md) for implemented rules and [progress](progress.md) for current verification and hosted acceptance gaps.

## Files and request flow

The main areas are `frontend/` (Next.js application, assets, components, styles, browser-safe shared schemas and smoke tests), `backend/` (authentication, permissions, operations, operator scripts and integration tests), `database/` (Prisma schema/migrations/seed, client, database scripts/tests and generated code), `vercel/` (release checks), and `.github/` (CI). Next.js runs with `frontend` as its project directory, discovers routes in `frontend/src/app` and serves assets from `frontend/public`. Route groups `(public)`, `(auth)`, and `(portal)` organize pages without changing URLs. Next.js and PostCSS configuration lives in `frontend`, with a TypeScript configuration extending the repository's shared strict settings. File tracing and Turbopack use the repository root to include backend/database modules. Root npm commands target the frontend directory and retain shared database/operator tooling. Shared business documentation stays in `docs/`.

Frontend/shared imports cannot reach backend or generated database code; lint rules enforce this separation. Backend code does not import UI or route entry points. HTTP route files delegate to backend modules. Database/auth server entry points retain their `server-only` markers.

A request to `/` is rendered using `frontend/src/app/layout.tsx` and `frontend/src/app/(public)/page.tsx`. The layout provides document language, metadata, skip link, and shared header/footer components. The homepage introduces the planned service with links to public information pages. Unknown routes render `frontend/src/app/not-found.tsx` with a home link. See [public website](public-website.md) for the full route map.

Pages and static content are server components by default. The header and catalogue use client boundaries for menu state, current-route highlighting, and service filtering. The error boundary is also a client component. Next.js supplies navigation/hydration runtime. Editorial service data sits in `frontend/shared/data/services.ts`; it does not establish operational availability. The request availability page awaits and validates category search parameters on the server.

`frontend/styles/globals.css` imports Tailwind and defines the small shared color/font foundation. `postcss.config.mjs` connects Tailwind's PostCSS plugin to the build. System fonts avoid external build-time font downloads. No component library is needed for this page.

`tsconfig.json` enables strict checking and maps frontend, backend, database and shared import aliases to their respective folders. Shared schemas are in `frontend/shared` and contain no UI or backend dependencies. TypeScript checks code relationships; shared Zod schemas validate inputs on both client and server. `next typegen` generates route types before `tsc --noEmit`, allowing checks on a fresh checkout.

`eslint.config.mjs` applies Next.js Core Web Vitals and TypeScript lint rules. Lint checks run explicitly and fail on warnings; a successful production build alone is not a lint result. Direct dependencies are pinned in `package.json`, with transitive versions/integrity in `package-lock.json`. Use `npm ci` to reproduce that dependency tree.

## Security at this stage

`frontend/next.config.ts` disables the framework-identification response header and sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`. These are baseline response protections, not authentication or a complete production security policy.

Account write endpoints live behind the strict `/api/auth/[...all]` route boundary. It checks origin, input shape/body size, endpoint allowlist, and trusted IP forwarding before invoking Better Auth. Password hashing, signed cookies, token lifecycle, and database-backed rate limits use the library. A credential-account database trigger atomically provisions only CUSTOMER membership/profile. Protected pages check current session, suspension and verification status. Operational writes and private photos have separate authenticated route boundaries, validation and ownership checks. CLI migrations and seeds use ignored `.env`; local servers bind to loopback. Secrets stay server-side because `NEXT_PUBLIC_*` values are browser-visible. See [authentication](authentication.md) and [operations](operations.md).

## Database boundary

`database/client/db.ts` exports a lazy singleton behind `server-only`; trusted CLI scripts use the client factory directly. Prisma's generated client lives in ignored `database/generated/prisma`; type-check and build commands regenerate it. `prisma.config.ts` defines schema, migrations, seed, and CLI connection URLs. `database/prisma/schema.prisma` declares the model, and checked-in SQL migrations add PostgreSQL constraints and indexes.

The public catalogue remains an editorial preview. The seed reads its category names/descriptions and creates inactive database reference rows without overwriting existing edits. Informational pages do not read job/user records; protected `/account` reads only the signed-in account. See [database design](database.md) for model boundaries, setup, and deferred entities.

Metadata requests no indexing while this is a prelaunch website. This is a search-engine instruction, not access control. Revisit it when launch details are verified. Review CSP, HTTPS/HSTS, cookies, CSRF, authorization, caching, and rate limits when their relevant features or deployment exist rather than claiming they are solved here.

## Framework references

- [Next.js installation and scripts](https://nextjs.org/docs/app/getting-started/installation)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)

The Phase 0 specification describes the future business architecture; this document describes only the current implementation.
