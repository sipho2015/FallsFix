# Backend

- `auth/`: authentication, sessions and verification/recovery email.
- `authorization/`: current role, ownership and technician assignment policies.
- `operations/`: service workflows, payments/refunds, reporting and photo retention.
- `scripts/`: account setup, audited administrator/owner settings and retention commands.
- `tests/`: authentication, authorization, operations and authenticated HTTP integration tests.

- `src/app/api/`: the internal Next.js API service's auth, operation, private-photo and health handlers.

The repository-root `vercel.json` defines this as the internal `backend` service. It has no public rewrite. The public frontend calls it using its `BACKEND_URL` binding; this grants reachability, while every existing session, origin, ownership and role check still applies. Authentication accepts the frontend's sanitized `x-fallsfix-proxy-client-ip` header for rate limiting, not a raw incoming public forwarding header.

Database access is in [`database/client`](../database/client). Server-rendered frontend pages also import shared backend/database modules directly. Run scripts through root package.json commands or from the repository root so private `.env` and `.local` paths resolve correctly. Use `npm run dev` to start both services; `dev:backend` is the command invoked internally by Vercel.
