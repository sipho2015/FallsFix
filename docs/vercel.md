# FallsFix on Vercel

Owner-selected host: Vercel. The owner has deployed an earlier version at `https://falls-fix.vercel.app`; `https://fallsfix.com` is the intended eventual canonical domain. Intended first administrator: `siphomoyo893@gmail.com`. Hosted PostgreSQL, SMTP delivery, domain ownership/DNS and owner-account verification remain unconfirmed.

The latest supplied Vercel log clones `feature/database-foundation` and fails at `release:check` because production authentication, PostgreSQL and SMTP settings are incomplete. Installing dependencies succeeded. Configuring services does not replace these required environment values or prove real delivery. Never provision the administrator before email verification.

## Services and public routing

Owner confirmed the service names, public routes and binding below on 2026-10-16.

The repository-root [`vercel.json`](../vercel.json) is the deployment configuration. The former `frontend/vercel.json` has been removed to avoid conflicting project roots.

| Service | Root | Public ingress | Calls |
| --- | --- | --- | --- |
| `frontend` | `frontend` | All public paths through `/(.*)`, including `/api/*` | `backend` through the generated `BACKEND_URL` binding |
| `backend` | `backend` | Internal only; no top-level rewrite | PostgreSQL and the configured SMTP service |

Both services use Next.js. The frontend serves pages/assets and a Node.js `/api/*` proxy. The backend owns the existing `/api/auth/*`, `/api/operations`, `/api/photos`, `/api/photos/:id` and `/api/health` handlers. The proxy preserves these paths and query strings; it does not strip `/api`. Browser fetch calls stay relative to the public origin. Cookies and verification/reset redirects retain that same public origin.

`BACKEND_URL` is declared only on the calling frontend service. Vercel generates it for that deployment at function runtime. Do not add it to `.env`, Vercel Environment Variables, browser bundles, Next.js configuration or build-time fetches. Missing bindings/unavailable backend return 503. The frontend forwards a single validated client IP from `AUTH_CLIENT_IP_HEADER` using a private internal header, replacing any public spoofed value. The internal API retains all session, origin, ownership and role checks; a binding is not user authorization.

This separates the HTTP API deployment. Server-rendered pages still import shared backend/database modules directly; it does not make the frontend a static site or remove its database access. Database, migration/seed/operator scripts, `.github` and documentation directories are not additional Vercel services.

## Project and database

Use `sipho2015/FallsFix` in the owner's Vercel project. In Settings > Build and Deployment, set **Root Directory to the repository root (`.`)**, replacing the previous `frontend` setting. Remove single-app Install/Build/Output overrides: each service's root configuration now owns these commands and uses its own `.next` output. Framework selection is explicit per service. The root config installs npm workspaces with `npm ci --prefix .. --include=dev`, then runs `release:check` and the appropriate `build:frontend` or `build:backend`. Both builds generate Prisma; neither runs migrations or seeds. Select Node 24 and verify the build runtime satisfies package.json (at least 24.16, below 25). Vercel runs Next.js functions; do not configure `npm start` as a hosted process or use static export.

Provision hosted PostgreSQL with a restricted application role, TLS and backup/restore support. Use the provider's supported pooled connection URL for application traffic; use a migration-capable direct connection for migrations if required. Place both services near the database, checking the provider's connection allowance against the pool of five connections per process in each service, plus scaling. Private photos live in the database, so capacity and backups must include them. Preview deployments must use a separate database and email configuration, never production customer data.

## Private environment variables

Configure these in the appropriate **Production** or **Preview** environment; never commit actual credentials. Preview builds do not receive Production-only variables. For initial production deployment, use `https://falls-fix.vercel.app` for both origins until `fallsfix.com` has working HTTPS/DNS. Each preview needs its own stable HTTPS origin for both values.

| Variable | Production value |
| --- | --- |
| `SITE_URL` | `https://fallsfix.com` |
| `BETTER_AUTH_URL` | `https://fallsfix.com` |
| `BETTER_AUTH_SECRET` | A private randomly generated secret of at least 32 characters |
| `DATABASE_URL` | Hosted PostgreSQL application connection URL |
| `AUTH_EMAIL_TRANSPORT` | `smtp` |
| `AUTH_CLIENT_IP_HEADER` | `x-vercel-forwarded-for` for direct Vercel hosting |
| `SMTP_HOST`, `SMTP_PORT` | Confirmed mail service; port 465 or 587 |
| `SMTP_USER`, `SMTP_PASSWORD` | Private SMTP credentials |
| `SMTP_FROM` | A sender authorized by that mail service |

The administrator Gmail address alone does not establish an SMTP provider or sender authorization. Confirm whether Gmail is also intended for mail delivery; do not use a normal Gmail password as SMTP credentials. Configure sender authentication according to the selected provider.

Vercel documents its [forwarded request headers](https://vercel.com/docs/headers/request-headers); confirm the chosen header supplies one real client IP with deployed registration/rate-limit tests, especially if another proxy is added. The application rejects lists as individual IPs. Set each preview's two origin variables to its own stable HTTPS preview origin and configure its own complete environment before building.

## Local verification

From the repository root, run `npm ci` followed by `npm run dev`. This uses pinned Vercel CLI 64.0.2 with `vercel dev -L --listen 127.0.0.1:3000`: both services start together, bindings are injected, and no cloud login is required. The first run needs a CLI download if it is not already cached. Stop both services with Ctrl+C before building. A standalone Next.js frontend server does not supply a backend binding.

`npm run check` checks both apps, `npm run test:auth:http` exercises the complete boundary with `vercel dev -L` against the isolated test database, and `npm run build` builds both apps sequentially. In CI, public smoke tests also run through the Vercel router. Verify public pages, `/api/health`, cookie round trips, verification redirects, role denial, private photo bytes and origin rejection. Hosted acceptance must additionally verify the backend has no direct public rewrite and that the trusted client IP survives Vercel ingress.

References: [Services](https://vercel.com/docs/services), [bindings](https://vercel.com/docs/services/bindings), [routing](https://vercel.com/docs/services/routing).

## Domain and rollout

1. Back up the hosted database, then apply migrations and seed reference data through a trusted operator environment with its private database URL. Seeding preserves edits and keeps new categories inactive. Do not run seed or migrations from every preview build.
2. Configure the private variables and connect `fallsfix.com` under the Vercel project's Domains settings. Use the exact DNS records Vercel supplies; do not guess registrar values. Configure `www.fallsfix.com` to redirect to the canonical apex if that alias is wanted.
3. Deploy and verify HTTPS, `/api/health`, registration/verification/recovery mail, logout, role denial and private photo upload/download. Use [the acceptance checklist](acceptance.md). Keep noindex during the pilot.
4. Register and verify the intended owner on the deployed application. Only then run `npm run admin:bootstrap -- siphomoyo893@gmail.com` against the confirmed production database, followed by the prepared owner-settings script. These are deliberate audited operator commands, never build hooks.
5. Install monitoring and database backups. Schedule the existing guarded photo-cleanup CLI on a trusted scheduled runner with private database access; Vercel does not run local CLI scripts periodically by itself. Do not claim retention scheduling is complete until executions and failure alerts are verified. Agree backup expiry and holds separately.
6. Conduct the actual operator pilot and record the launch decision. Verify rollback to a compatible application artifact without dropping financial/audit data.

Vercel's [function payload limit](https://vercel.com/docs/functions/limitations#request-body-size) is 4.5 MB. FallsFix now limits raw photo uploads to 4 MiB (shown as 4 MB) in the client, bounded request reader and image decoder. Existing stored photos remain unchanged; validate their downloads on the host. If larger evidence files become necessary, design private direct object-storage uploads with authorization and retention rather than raising the function-body limit.
