# Frontend

- `components/`: customer, technician, administrator and public interface components.
- `styles/`: application styles.
- `shared/`: browser-safe data and validation schemas, also used by the backend.
- `tests/`: public-site HTTP smoke tests.

Next.js route entry points are in [`src/app`](src/app), and public assets in [`public`](public). This folder is the frontend Next.js project root, with Next.js, PostCSS and TypeScript configuration. The repository-root `vercel.json` owns deployment and public routing.

The `/api/*` route handler forwards requests to the internal backend through the runtime-only `BACKEND_URL` binding in [`server/backend.ts`](server/backend.ts). It preserves paths, query strings, cookies, redirects and streamed bodies. Client fetch calls remain relative `/api/...` URLs. It forwards only the configured trusted ingress IP as a private internal header; caller-supplied private headers are discarded. Missing bindings/backend failures return 503 rather than falling back to a public or localhost server.

Server-rendered pages continue to compose shared backend/database modules directly. This split isolates the HTTP API deployment, not all server-side data access. Run `npm run dev` from the repository root to start both services with `vercel dev -L`; Vercel generates the binding. Private local environment configuration remains in the root `.env` and is loaded by the frontend Next.js configuration.
