# Customer authentication — Phase 5

The previous login/registration availability pages are replaced by real customer account forms. Better Auth 1.7.6 handles password hashing, verification/reset tokens, signed session cookies, and session persistence through its Prisma adapter. Zod validates the application's allowed inputs. No social login, administrator signup, technician signup, dashboards, or booking workflow is enabled.

## Local setup

Start the project PostgreSQL cluster, then run:

```powershell
npm ci
npm run db:deploy
npm run auth:setup
npm run dev
```

Open `http://127.0.0.1:3000/register`. Use that exact host/port: `BETTER_AUTH_URL` determines the allowed origin and email links. If choosing another port, update that value in your private `.env` and restart. The setup command appends missing local values without replacing existing configuration or displaying secrets. It generates a random secret; it does not create an account or password.

Development uses `AUTH_EMAIL_TRANSPORT=file`. Register using an address you control, then open the matching JSON file under ignored `.local/auth-mail` in your editor and follow its verification URL. These files contain private, short-lived links: do not commit, screenshot, share, or serve them publicly. They are not actual delivered emails. Log in after verification. Password recovery writes a reset link to the same private directory. Delete local messages once no longer needed; they have no automatic retention cleanup. Only the operating-system account and trusted administrators should have workspace access.

`/account` requires a valid, verified, active session on the server. Anonymous visitors are redirected to `/login`. It currently shows basic account information and sign out; it does not pretend to be the future customer dashboard. Informational pages continue to render without database/auth configuration. Account API requests fail with a generic 503 if configuration or the database is unavailable.

## Security and data

- Passwords use Better Auth's scrypt implementation, with application limits of 12–128 characters for new passwords. No plaintext passwords are stored or logged.
- Registration accepts only name, email, and password. Unknown properties, including role/status, are rejected. Email is trimmed and lowercased before persistence. A PostgreSQL trigger creates the CUSTOMER role and customer profile atomically when a credential Account is inserted. It never grants ADMIN or TECHNICIAN. This avoids a second connection provisioning business records before an adapter transaction commits.
- Verification is required before login. Verification and reset links expire after one hour. Password reset consumes the token and revokes every existing session. Verification does not automatically sign in.
- Database sessions expire after seven days, with a one-day refresh interval. Cookie caching is disabled. Cookies are HttpOnly, SameSite=Lax, and Secure on HTTPS. Local development alone permits loopback HTTP. Successful POST responses return only a success flag, never the session token.
- Every protected account read checks the current User status and email verification in PostgreSQL. Suspension invalidates that user's stored sessions when encountered; suspended users also cannot create new sessions. Future APIs must use the same check and then apply Phase 6 role/ownership policies. This is not a complete RBAC implementation.
- The API allows only the listed routes below. Mutations require the exact configured Origin and JSON content type, validate strict schemas, and cap bodies at 16 KiB. Better Auth's own CSRF protections remain enabled. Callback destinations are fixed by the server, so callers cannot redirect verification/reset to another site.
- Recovery and duplicate-registration responses do not disclose whether an address exists. Email work runs through Next.js `after()` following the response. Delivery failures log a fixed message without addresses, tokens, or credentials. There is no durable mail queue or automatic retry yet; users may request another link, and delivery monitoring is a deployment requirement.
- Database-backed limits apply in development too: five login/reset attempts and three signup/recovery/resend attempts per IP per minute; other library endpoints have a general 60/minute limit. The API maps the library's `X-Retry-After` to standard `Retry-After`. Without a configured proxy header, local callers share one loopback bucket. These limits do not replace deployment-level abuse controls or distributed attack protection.
- Responses are not cacheable. Authentication/reset routes use `Referrer-Policy: no-referrer`. Proxy/access logs must redact query strings and request bodies for account routes, because emailed URLs contain tokens.

New database records are User.emailVerified/image, Account, Session, Verification, and RateLimit. Business identity/history foreign keys remain restricted; session/account records cascade when an otherwise deletable user is removed. No public user-deletion endpoint is exposed. Auth records are not seeded. The migration preserves the existing schema/data and is applied through normal Prisma migrations.

## API surface

All routes are under `/api/auth/`. Call POST routes from the configured same origin with `Content-Type: application/json`.

| Method / path | Accepted body or purpose |
| --- | --- |
| POST `sign-up/email` | `name`, `email`, `password`; customer only |
| POST `sign-in/email` | `email`, `password`; sets signed cookie |
| POST `sign-out` | `{}`; deletes session and expires cookie |
| POST `request-password-reset` | `email`; generic acknowledgement |
| POST `send-verification-email` | `email`; generic acknowledgement |
| POST `reset-password` | `token`, `newPassword`; single-use reset |
| GET `verify-email` | Library-generated token; redirects to login |
| GET `reset-password/:token` | Library-generated token; redirects to reset form |
| GET `get-session` | Safe `{ user: { id, name, email }, expiresAt }` or `null` |

User-facing pages are `/login`, `/register`, `/forgot-password`, `/verify-email`, `/reset-password`, and protected `/account`. API error responses do not expose database/configuration errors. Public information and request availability pages remain prelaunch.

## Production configuration

Local file delivery is intentionally refused under `NODE_ENV=production`. Running `npm start` with the local `.env` can preview public/forms pages but cannot operate account APIs. Do not disable this restriction to make production appear ready.

Before enabling accounts on a deployed host:

1. Set a stable HTTPS `BETTER_AUTH_URL` and a newly generated, private `BETTER_AUTH_SECRET` of at least 32 random characters. Keep secrets in the deployment secret store. Rotating the secret invalidates signed sessions and outstanding signed links.
2. Set `AUTH_EMAIL_TRANSPORT=smtp`, `SMTP_HOST`, `SMTP_PORT` (465 or 587), `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` for a verified sender. TLS/certificate verification remains enabled. The owner's public Gmail contact address is not an SMTP credential or configured sender.
3. Set `AUTH_CLIENT_IP_HEADER` to one single-IP header, such as `x-real-ip`, that your trusted reverse proxy always overwrites. Prevent clients from reaching the origin directly. This setting is an operator assertion, not automatic validation of network trust; a spoofable header defeats IP rate limiting. Forwarded headers supplied outside this explicit configuration are ignored.
4. Apply migrations, supply the production database connection with least-privilege runtime access, establish backups and mail/error monitoring, redact authentication logs, and verify actual SMTP receipt, HTTPS cookies, CSRF behavior, and proxy limits in staging. No SMTP credentials have been supplied or delivery tested here.
5. Complete privacy/retention notices and browser/accessibility checks before public account collection. Service bookings remain closed until their workflow and authorization are implemented.

## Verification

```powershell
npm run check
npm run test:auth
npm run test:database
npm run test:auth:http
npm run build
npm start -- --port 3100
# In another terminal:
npm run test:smoke
```

`test:auth` migrates only the guarded `fallsfix_test` database. Tests exercise the real Better Auth handler, Prisma adapter, cookies, rate limiter, and application request boundary with captured in-memory emails. Generated fixture passwords are random. Cleanup removes only this run's fixture identities and related rows; there is no database reset/truncate. Tests cover verification gates, customer-only provisioning, password hashing, cookie flags, logout, reset single use/session revocation, suspended accounts, generic recovery, validation/CSRF/body limits, and deployment configuration refusal. These are server integration tests, not browser end-to-end or actual SMTP tests.

`test:auth:http` starts and stops its own Next development process on loopback port 3217, pointing only at the guarded test database. Stop any other development server in this checkout first; the test refuses an unavailable port/dev lock. It verifies a real HTTP signup, Next's post-response local email write, verification, login cookie, server-rendered account, and logout. It removes its own fixture and captured mail file. Next's loading boundary can stream a 200 response with a login redirect meta tag instead of sending a 307; tests validate both redirect forms and absence of protected account content. Production smoke tests ran separately on port 3102 because 3100 was already occupied.

Recorded Phase 5 results: seven auth integration tests, one Next HTTP account-flow test, twelve database integrity tests, and four production public-route tests passed. Lint, strict TypeScript, and the production build passed. npm audit reported zero known vulnerabilities. This does not verify SMTP delivery or browser interaction.

The browser skill was retried during Phase 5; no connected browser was available. Keyboard/form submissions, password-manager integration, screen-reader feedback, responsive layouts, and full browser navigation remain pending. Existing Phase 3 browser checks also remain open.

## References

- [Better Auth email/password flows](https://better-auth.com/docs/authentication/email-password)
- [Prisma adapter](https://better-auth.com/docs/adapters/prisma)
- [Database schema and hooks](https://better-auth.com/docs/concepts/database)
- [Rate limiting and IP trust](https://better-auth.com/docs/concepts/rate-limit)
- [Next.js integration](https://better-auth.com/docs/integrations/next)

Phase 6 now supplies [centralized role/ownership read enforcement and protected workspace routing](authorization.md). Operational dashboards and mutation policies remain for subsequent phases.
