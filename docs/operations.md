# Operational application

The development implementation now covers the customer, administrator, and technician workflows described in phases 7-17. The site receives **requests for review**, not guaranteed bookings. Browser verification and live operational acceptance remain release gates.

## Using the application

1. Register, verify the email, and log in. In local development, verification mail is captured in the private `.local/auth-mail` directory.
2. Open Request a Service, choose a category, describe the problem, and supply the contact/location. Successful submission opens a saved request with an FF reference. Preferred times use Africa/Harare (CAT) and are not confirmed appointments.
3. Open the customer workspace from My Account to track requests, edit permitted profile fields, apply as a technician, and read notifications.
4. An administrator reviews requests, verifies technician qualifications/coverage, activates categories, and assigns eligible technicians. Account suspension, technician access, role changes, catalogue changes, invoice identity, and request-intake settings retain audit records.
5. Technicians accept or decline current assignments, assess the issue, add shared notes/photos, and record valid work progress. Ended assignments expose only the technician's own reference/category/status history, without former customer contact details.
6. Administrators save/edit a private quotation draft or send an immutable revision. The owning customer approves/rejects the current, unexpired revision. Additional scope requires a replacement quotation and new approval. Assessment visits must explicitly be free; chargeable visits use the quote-approved work flow.
7. Administrators record appointment agreement and check overlaps. Technicians record travel, arrival, work, and a completion summary. Customers confirm completion or open a complaint. Administrators document complaint resolution or rework within approved scope.
8. Set the invoice issuer and address before issuing invoices. Issuance copies the approved quote and issuer details. Customers view and print/save invoices as PDF. Administrators record actual partial/full receipts and reasoned reversals; this is manual bookkeeping, not a payment gateway.
9. Customers may review completed jobs once. Administrators may hide review text with a recorded reason but cannot change its rating. Closure requires an issued, settled invoice (including explicit zero-charge invoices) and no open complaint.

## Boundaries and integrity

- `POST /api/operations` authenticates the session, verifies the origin, limits request size/rate, validates the discriminated operation schema, and runs the operation in a transaction. Identity and roles never come from the submitted body.
- Jobs are row-locked and version-checked. Job state, history, audit entries, and durable notification records commit together. Request keys and payment operation IDs protect retries; conflicting payloads are rejected. Database indexes prevent multiple current assignments, current quotes, or issued invoices.
- All prices are integer minor units; inputs have up to two decimal places. Supported currencies are explicit (USD, ZAR, ZWG). No taxes, commissions, fees, prices, or contracting entity are invented. Itemized agreed scope must disclose any applicable charges. Invoice/report totals never combine currencies.
- Requests can be received for review before a category has verified coverage. Inactive categories cannot receive assignments. Administrators can close intake globally. Existing seed rows remain inactive until an administrator verifies coverage.
- `POST /api/photos?jobId=...` accepts at most 4 MB, verifies decoding/type and a 20-megapixel limit, strips metadata by re-encoding to WebP, and limits requests to ten photos. SVG and animated/malformed formats are rejected. Authenticated reads are private/no-store and recheck current ownership/assignment. Photos live in PostgreSQL, not `public`; database backups include them.
- Customers never receive private drafts, internal notes, audit details, or other customers' records. Technicians see only current work details and approved scope, not invoice/payment/complaint records. Administrator-only internal notes remain administrator-only in the UI.
- Role/suspension changes invalidate sessions. The first administrator is explicitly provisioned with `npm run admin:bootstrap -- verified-owner@example.com`; it refuses to run when an administrator already exists. Later administrator grants/removals use the audited administrator workspace.
- Open support complaints after job closure do not reopen chargeable work. Post-start cancellation and exceptional post-start reassignment require a separately agreed support procedure; the UI does not silently reset work or invent fees/refunds.
- Reports show stored job status counts/current workload and invoices issued in a selected period with all non-reversed receipts against that invoice cohort. This is not a cash-flow/tax/commission accounting report.

## Verification commands

- `npm run check`
- `npm run test:operations`
- `npm run test:database`
- `npm run test:auth`
- `npm run test:authorization`
- `npm run test:auth:http` (isolated `.next-auth-test` output and dedicated test database)
- `npm run build`, then `npm start -- --port 3100` and `npm run test:smoke`
- `npm run db:restore-drill` (local-only backup and disposable restore with row-count reconciliation)
- `npm run release:check` (configuration gate; does not claim SMTP/hosting verification)

The meaningful integration tests cover request retry/ownership, profile snapshot preservation, stale and concurrent updates, assignment decline/revocation, scope gates, draft/revision behavior, complaints, completion, exact money, receipts/reversals/overpayment, review uniqueness, closure, and photo normalization. The authenticated HTTP test exercises actual sessions, request submission, origin/role rejection, private uploads/downloads, and portal routing.

## Phase status

| Phases | Development status | Remaining evidence / work |
| --- | --- | --- |
| 7-11 | Profiles, role workspaces, requests, assignments, valid transitions, history implemented | Interactive browser checks; exceptional post-start handover/cancellation policies |
| 12 | Private database-backed photo uploads implemented | Hosted body-size limits, storage capacity and retention policy |
| 13 | Editable private drafts, immutable quote revisions, approval/rejection and scope gates implemented | Commercial terms and real operator acceptance |
| 14 | Invoice snapshots, print/PDF, manual partial receipts/reversals implemented | Approved issuer/tax/fee/refund/commission policies; no gateway integration |
| 15 | Durable in-app notifications implemented | Additional external notification adapters are not configured |
| 16 | Reviews, moderation, complaints and settlement-gated closure implemented | Support ownership and real dispute pilot |
| 17 | Operational counts, workload, invoice-cohort totals implemented | Business reconciliation in pilot; cash-flow/commission reporting is outside these totals |
| 18-19 | Server guards, constraints, bounded uploads, integration/HTTP tests, dependency audit and CI configuration implemented | Browser accessibility/visual/end-to-end testing and independent production security review |
| 20 | Production build, health endpoint, release gate, backup/restore drill and runbook prepared | Hosting/domain/HTTPS/SMTP, real deployment, hosted monitoring/backups and rollback exercise |
| 21 | Launch checklist prepared | Real authorized pilot, agreed policies, support operator and launch decision |

No production deployment or completed business launch is claimed.

## Owner-confirmed policies supersede preliminary boundaries

See [owner decisions](owner-decisions.md), confirmed 2026-09-30. New quotes use typed charges and 14-day validity. Approved call-out pricing is required before dispatch; the prior unquoted free-assessment scheduling path is replaced by explicit approval of the visit (including a recorded waiver). Additional scope still requires customer approval; work already started resumes after approval rather than requiring another travel cycle.

Invoice snapshots now support optional business contact and legal identifiers without fabricated values, technician reference, item types, payment status, credits and refunds. Failed repair settlement can be recorded without falsely completing the repair. Refund approval uses 65% of eligible actual receipts, with explicit excluded approved costs and an audited invoice credit; disbursement is separate from payment reversal. Original invoice/receipt values remain intact. Labour allocation is 75/25 only on classified labour; reports net settlement credits and paid refunds by currency.

Completion and its in-app notification start the three-day rework window. Active complaints, refund payments pending, rework and manual holds block photo deletion. The cleanup script rechecks under the same job lock used by support/upload operations. Its default is preview only; deployment must schedule `npx tsx backend/scripts/cleanup-job-photos.ts --apply` and establish protected-backup expiry. Historical records without trustworthy completion timestamps are preserved for review.
