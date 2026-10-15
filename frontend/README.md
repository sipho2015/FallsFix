# Frontend

- `components/`: customer, technician, administrator and public interface components.
- `styles/`: application styles.
- `shared/`: browser-safe data and validation schemas, also used by the backend.
- `tests/`: public-site HTTP smoke tests.

Next.js route entry points are in [`src/app`](src/app), and public assets in [`public`](public). This folder is the Next.js project root and contains its Next.js, PostCSS, TypeScript and Vercel configuration. Routes compose the frontend and call backend modules from the repository. Root npm commands automatically target this folder; continue running them from the repository root. Private local environment configuration remains in the root `.env` and is loaded by the frontend Next.js configuration.
