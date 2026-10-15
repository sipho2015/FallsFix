# Backend

- `auth/`: authentication, sessions and verification/recovery email.
- `authorization/`: current role, ownership and technician assignment policies.
- `operations/`: service workflows, payments/refunds, reporting and photo retention.
- `scripts/`: account setup, audited administrator/owner settings and retention commands.
- `tests/`: authentication, authorization, operations and authenticated HTTP integration tests.

API route entry points are in `frontend/src/app/api`, where Next.js discovers them. Database access is in [`database/client`](../database/client). Run scripts through the root package.json commands or from the repository root so private `.env` and `.local` paths resolve correctly.
