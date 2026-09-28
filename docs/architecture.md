# Application foundation

Phase 2 introduces a single Next.js application using the App Router, React, strict TypeScript, and Tailwind CSS. Database access, authentication, APIs, and portals remain planned.

## Files and request flow

A request to `/` is rendered using `app/layout.tsx` and `app/page.tsx`. The layout provides the document language, metadata, skip link, header, and footer. The page is an honest coming-soon notice, not the Phase 3 public website. Unknown routes render `app/not-found.tsx` with a home link.

These components are server components by default: their rendering code runs on the server rather than requiring a client component for static text. Add a client boundary only when browser state or interaction requires it. Next.js still provides its own navigation/hydration runtime.

`app/globals.css` imports Tailwind and defines the small shared color/font foundation. `postcss.config.mjs` connects Tailwind's PostCSS plugin to the build. System fonts avoid external build-time font downloads. No component library is needed for this page.

`tsconfig.json` enables strict checking and the `@/*` project-root alias. TypeScript checks code relationships but does not validate runtime user input; server input validation will arrive with forms. `next typegen` generates route types before `tsc --noEmit`, allowing type checks after a fresh dependency installation without first running the development server.

`eslint.config.mjs` applies Next.js Core Web Vitals and TypeScript lint rules. Lint checks run explicitly and fail on warnings; a successful production build alone is not a lint result. Direct dependencies are pinned in `package.json`, with transitive versions/integrity in `package-lock.json`. Use `npm ci` to reproduce that dependency tree.

## Security at this stage

`next.config.ts` disables the framework-identification response header and sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`. These are baseline response protections, not authentication or a complete production security policy.

There are no credentials, data writes, uploads, or protected resources yet. Local development/start commands bind to loopback. No environment values are required; `.env.example` documents that deliberately. Future secrets must stay server-side; `NEXT_PUBLIC_*` values are browser-visible.

Metadata requests no indexing while this is a prelaunch foundation. This is a search-engine instruction, not access control. Revisit it for the Phase 3 website. Review CSP, HTTPS/HSTS, cookies, CSRF, authorization, caching, and rate limits when their relevant features or deployment exist rather than claiming they are solved here.

## Framework references

- [Next.js installation and scripts](https://nextjs.org/docs/app/getting-started/installation)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)

The Phase 0 specification describes the future business architecture; this document describes only the current implementation.
