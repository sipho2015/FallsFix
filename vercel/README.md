# Vercel

- `scripts/check-release.ts`: validates required production configuration before a hosted build.
- [Deployment guide](../docs/vercel.md): domain, database, SMTP and operator setup.

Vercel's project Root Directory must be `frontend`, with files outside that root included. Vercel discovers `frontend/vercel.json`, which installs the root npm workspace and calls this folder's release check through root package.json. `.vercel/`, if created by account linking, is private local deployment metadata and remains ignored. No credentials belong in this folder.
