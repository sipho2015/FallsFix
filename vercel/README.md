# Vercel

- `scripts/check-release.ts`: validates required production configuration before a hosted build.
- [Deployment guide](../docs/vercel.md): domain, database, SMTP and operator setup.

Vercel's project Root Directory must be the repository root (`.`). The root [`vercel.json`](../vercel.json) defines public `frontend` and internal `backend` services. Installation, build and development commands live under each service; the only public rewrite targets the frontend. The frontend declares the caller-side `BACKEND_URL` binding to the backend. Do not configure this generated variable yourself.

`npm run dev` runs the pinned CLI with `vercel dev -L`, which starts both services and generates the binding without linking a cloud account. `.vercel/`, if created by account linking, is private local deployment metadata and remains ignored. No credentials belong in this folder. The production release gate remains enabled for both builds: services configuration does not supply PostgreSQL or SMTP credentials.
