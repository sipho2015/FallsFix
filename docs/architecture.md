# Application architecture

Phase 2 introduced Next.js, React, TypeScript, and Tailwind. Phase 3 added public pages, Phase 4 PostgreSQL/Prisma, and Phase 5 Better Auth. Phase 6 adds [server-side role/ownership guards and protected workspace entry pages](authorization.md). Business APIs and operational dashboards remain planned.

## Files and request flow

Application source is grouped under `src/`: `app` owns Next.js web/API entry points, `frontend` owns UI/styles, `backend` owns authentication/permissions/database access, and `shared` owns browser-safe schemas and reference data. Route groups `(public)`, `(auth)`, and `(portal)` organize pages without changing URLs. They share one root layout. Prisma schema/migrations stay in root `prisma/`; tests, scripts, configuration, and environment files retain their dedicated root locations. New business services belong in `src/backend/services/` when implemented; no empty placeholder modules are needed. Static assets belong in root `public/`, while framework metadata such as `icon.svg` remains in `src/app`.

Frontend/shared imports cannot reach backend or generated database code; lint rules enforce this separation. Backend code does not import UI or route entry points. HTTP route files delegate to backend modules. Database/auth server entry points retain their `server-only` markers.

A request to `/` is rendered using `src/app/layout.tsx` and `src/app/(public)/page.tsx`. The layout provides document language, metadata, skip link, and shared header/footer components. The homepage introduces the planned service with links to public information pages. Unknown routes render `src/app/not-found.tsx` with a home link. See [public website](public-website.md) for the full route map.

Pages and static content are server components by default. The header and catalogue use client boundaries for menu state, current-route highlighting, and service filtering. The error boundary is also a client component. Next.js supplies navigation/hydration runtime. Editorial service data sits in `src/shared/data/services.ts`; it does not establish operational availability. The request availability page awaits and validates category search parameters on the server.

`src/frontend/styles/globals.css` imports Tailwind and defines the small shared color/font foundation. `postcss.config.mjs` connects Tailwind's PostCSS plugin to the build. System fonts avoid external build-time font downloads. No component library is needed for this page.

`tsconfig.json` enables strict checking and maps `@/*` to `src/*`. TypeScript checks code relationships; shared Zod schemas validate account form inputs on both client and server. `next typegen` generates route types before `tsc --noEmit`, allowing type checks after a fresh dependency installation without first running the development server.

`eslint.config.mjs` applies Next.js Core Web Vitals and TypeScript lint rules. Lint checks run explicitly and fail on warnings; a successful production build alone is not a lint result. Direct dependencies are pinned in `package.json`, with transitive versions/integrity in `package-lock.json`. Use `npm ci` to reproduce that dependency tree.

## Security at this stage

`next.config.ts` disables the framework-identification response header and sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`. These are baseline response protections, not authentication or a complete production security policy.

Account write endpoints live behind the strict `/api/auth/[...all]` route boundary. It checks origin, input shape/body size, endpoint allowlist, and trusted IP forwarding before invoking Better Auth. Password hashing, signed cookies, token lifecycle, and database-backed rate limits use the library. A credential-account database trigger atomically provisions only CUSTOMER membership/profile. The protected account page checks session validity and current suspension/verification status on the server. See [authentication](authentication.md) for configuration, routes, tests, and limitations. There are no uploads or operational job-write endpoints yet. CLI migrations and seeds use ignored `.env`; local servers bind to loopback. Secrets stay server-side because `NEXT_PUBLIC_*` values are browser-visible.

## Database boundary

`src/backend/database/db.ts` exports a lazy singleton behind `server-only`; trusted CLI scripts use the client factory directly. Prisma's generated client lives in ignored `generated/prisma`; type-check and build commands regenerate it. `prisma.config.ts` defines schema, migrations, seed, and CLI connection URLs. `prisma/schema.prisma` declares the core model, and the checked-in SQL migration adds supported PostgreSQL constraints plus a partial unique index for current assignments.

The public catalogue remains an editorial preview. The seed reads its category names/descriptions and creates inactive database reference rows without overwriting existing edits. Informational pages do not read job/user records; protected `/account` reads only the signed-in account. See [database design](database.md) for model boundaries, setup, and deferred entities.

Metadata requests no indexing while this is a prelaunch website. This is a search-engine instruction, not access control. Revisit it when launch details are verified. Review CSP, HTTPS/HSTS, cookies, CSRF, authorization, caching, and rate limits when their relevant features or deployment exist rather than claiming they are solved here.

## Framework references

- [Next.js installation and scripts](https://nextjs.org/docs/app/getting-started/installation)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)

The Phase 0 specification describes the future business architecture; this document describes only the current implementation.
