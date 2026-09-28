# Application architecture

Phase 2 introduced a single Next.js application using the App Router, React, strict TypeScript, and Tailwind CSS. Phase 3 added public prelaunch pages; Phase 4 adds PostgreSQL and Prisma infrastructure. Authentication, business APIs, and portals remain planned.

## Files and request flow

A request to `/` is rendered using `app/layout.tsx` and `app/page.tsx`. The layout provides document language, metadata, skip link, and shared header/footer components. The homepage introduces the planned service with links to public information pages. Unknown routes render `app/not-found.tsx` with a home link. See [public website](public-website.md) for the full route map.

Pages and static content are server components by default. The header and catalogue use client boundaries for menu state, current-route highlighting, and service filtering. The error boundary is also a client component. Next.js supplies navigation/hydration runtime. Editorial service data sits in `data/services.ts`; it does not establish operational availability. The request availability page awaits and validates category search parameters on the server.

`app/globals.css` imports Tailwind and defines the small shared color/font foundation. `postcss.config.mjs` connects Tailwind's PostCSS plugin to the build. System fonts avoid external build-time font downloads. No component library is needed for this page.

`tsconfig.json` enables strict checking and the `@/*` project-root alias. TypeScript checks code relationships but does not validate runtime user input; server input validation will arrive with forms. `next typegen` generates route types before `tsc --noEmit`, allowing type checks after a fresh dependency installation without first running the development server.

`eslint.config.mjs` applies Next.js Core Web Vitals and TypeScript lint rules. Lint checks run explicitly and fail on warnings; a successful production build alone is not a lint result. Direct dependencies are pinned in `package.json`, with transitive versions/integrity in `package-lock.json`. Use `npm ci` to reproduce that dependency tree.

## Security at this stage

`next.config.ts` disables the framework-identification response header and sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`. These are baseline response protections, not authentication or a complete production security policy.

There are no public data-write endpoints, uploads, or protected customer resources yet. CLI migrations and seeds use local database credentials from ignored `.env`. Local app/database commands bind to loopback. Public pages do not use database credentials; future secrets must remain server-side because `NEXT_PUBLIC_*` values are browser-visible.

## Database boundary

`lib/database/db.ts` exports a lazy singleton behind `server-only`; trusted CLI scripts use the client factory directly. Prisma's generated client lives in ignored `generated/prisma`; type-check and build commands regenerate it. `prisma.config.ts` defines schema, migrations, seed, and CLI connection URLs. `prisma/schema.prisma` declares the core model, and the checked-in SQL migration adds supported PostgreSQL constraints plus a partial unique index for current assignments.

The public catalogue remains an editorial preview. The seed reads its category names/descriptions and creates inactive database reference rows without overwriting existing edits. No public page reads job/user records yet. See [database design](database.md) for model boundaries, setup, and deferred entities.

Metadata requests no indexing while this is a prelaunch website. This is a search-engine instruction, not access control. Revisit it when launch details are verified. Review CSP, HTTPS/HSTS, cookies, CSRF, authorization, caching, and rate limits when their relevant features or deployment exist rather than claiming they are solved here.

## Framework references

- [Next.js installation and scripts](https://nextjs.org/docs/app/getting-started/installation)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)

The Phase 0 specification describes the future business architecture; this document describes only the current implementation.
