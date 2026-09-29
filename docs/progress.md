# Working progress

- Current implementation: Phase 6, centralized roles/ownership and protected workspace entry pages.
- Next: Phase 7, customer profile and portal with honest empty/read states; retain ownership checks.
- Branch: `feature/role-authorization`. No push or deployment requested.
- Core references: `docs/phase-0-specification.md` roadmap, `docs/business-rules.md`, `docs/authorization.md`.
- Account guard: `lib/authorization/server.ts`; testable policies: `lib/authorization/policy.ts`.
- Checks for permission changes: `npm run check`, `npm run test:authorization`, `npm run test:auth:http`, `npm run build`. Stop the dev server before the HTTP suite.
- Phase 6 verification: four authorization tests, the expanded real HTTP account/role flow, lint, TypeScript, and production build passed.
- Outstanding: browser/SMTP verification, later audited role management, operational dashboards, deployment and business approvals. Bookings stay closed.
- User preference: minimal updates, targeted reads/tests, concise docs, no optional features or subagents. Stop at the current phase boundary.
