# Proposed business rules

These policies are the Phase 0 design baseline, not implemented behavior or approved commercial terms. They centralize decisions that would otherwise become inconsistent across screens. Changes must update this document, the specification, and eventually the corresponding domain logic and tests.

## Identity and permissions

| ID | Proposed rule |
| --- | --- |
| BR-01 | Public registration creates a customer role only. An administrator grants technician or administrator roles through a protected, audited process. No client-supplied role grants privileges. |
| BR-02 | Users may hold multiple explicit roles. Server operations check both the required role and the particular record being accessed. Roles never imply unrelated roles. |
| BR-03 | Customers access only their own requests, quotes, invoices, photos, and reviews. Technicians access only currently assigned job details needed for the work; historical access is limited to their own work records with unnecessary customer details withheld. |
| BR-04 | Only active, verified technicians with the relevant category and service-area eligibility may receive assignments. Administrator verification records reviewer, date, and outcome; actual evidence requirements await business approval. |
| BR-05 | Disable access for suspended accounts and revoke or invalidate affected sessions. Role, verification, and suspension changes are audited. |

## Requests, assignment, and work

| ID | Proposed rule |
| --- | --- |
| BR-06 | Every request belongs to one customer, category, and service location. A submitted address is a job snapshot; editing a profile address must not rewrite job history. Preferred time is a request, not a guaranteed booking. |
| BR-07 | Only administrators assign or reassign technicians. At most one assignment is current. Preserve old assignments, reasons, timestamps, and acceptance outcomes. |
| BR-08 | A technician may accept or decline their pending assignment with a reason for declining. Decline returns the job to review; it does not cancel the customer's request. Reassignment invalidates the previous technician's permission to update that job. |
| BR-09 | Customers may cancel before work starts. Any previously disclosed call-out charge requires administrator review; cancellation must not silently create a fee. Once work begins, customers request support and administrators resolve cancellation, work already done, and billing with recorded reasons. |
| BR-10 | Only the current assigned technician records assessment, travel, arrival, start, and completion. Administrative corrections require an explicit audited operation and reason, not arbitrary status editing. |
| BR-11 | Work requires a customer-approved quote or an explicitly accepted fixed-price scope. Inspection or call-out charges must be disclosed and accepted before the chargeable visit. Unknown pricing cannot be treated as zero or implicitly approved. |
| BR-12 | Administrators confirm schedules after customer agreement and technician availability. Assessment visits may be scheduled before a quote; a work appointment requires approved scope. Store appointment purpose separately from job status. |
| BR-13 | Technician completion requires a work summary. Customer confirmation is a separate event. A dispute keeps the job open for administrator resolution; inactivity must not automatically imply customer acceptance in the MVP. |
| BR-14 | Every transition records actor, timestamp, old/new status, and relevant reason in the same transaction as the job update. Reject invalid transitions, stale concurrent updates, and unauthorized actors. |
| BR-15 | Closed jobs are immutable workflow records. Follow-up work creates a linked request. Corrections to financial records use explicit adjustment processes rather than overwriting history. |

## Quotations and financial records

| ID | Proposed rule |
| --- | --- |
| BR-16 | Administrators create and send quotes; technicians supply assessment notes. Quotes contain item descriptions, quantities, unit amounts, currency, scope, validity, and any applicable disclosed fees/taxes. |
| BR-17 | Draft quotes are editable. Sent quotes are immutable revisions. Replacing a sent quote supersedes it; the customer must approve the current unexpired revision. Rejection returns the job to assessment/review for revision or cancellation, never directly to work. |
| BR-18 | Only the owning customer approves/rejects a quote. Record the exact revision, identity, and time. Additional chargeable work requires a new approved revision before that work begins. |
| BR-19 | Administrators issue invoices after customer confirmation or documented dispute resolution. An invoice snapshots agreed charge lines and has a unique number. An issued invoice is not silently edited or deleted. |
| BR-20 | Only administrators record received payments. Record amount, currency, method, received time, reference where available, and recording actor. A manual record is not verification from a bank or payment gateway. |
| BR-21 | Use exact decimal or integer minor-unit money arithmetic, never floating-point calculations. A job's quote, invoice, and payments share one currency. Partial payments are allowed; reject overpayment in the MVP pending a deliberate credit/refund policy. Never sum unlike currencies in reports. |
| BR-22 | Payment submissions are idempotent: retrying one operation must not create a second payment. Reversals preserve original records and require an administrator and reason. Invoice balance derives from issued totals and valid payment/adjustment records. |
| BR-23 | Configurable fees and commission settings apply prospectively and are snapshotted onto applicable records. Changing settings must not recalculate previously agreed charges. Commission is an internal allocation unless explicitly disclosed as a customer charge. |

## Reviews, closure, and support

| ID | Proposed rule |
| --- | --- |
| BR-24 | The owning customer may leave one review per confirmed completed job, including after closure. Ratings use a defined 1–5 scale. Administrators may hide abusive/private content with an audited reason; they cannot rewrite a customer's rating. |
| BR-25 | Close a job only after completion confirmation/resolution, required invoice settlement, and resolution of blocking complaints. A review is optional and never blocks closure. Zero-charge work needs an explicit documented no-charge outcome. |
| BR-26 | Customer-visible notes and internal notes are distinct. Customers never receive internal technician vetting, commission, or administrator-only notes. |
| BR-27 | Complaints link to the customer and optionally a job, have an owner and resolution status, and remain accessible only to authorized participants. Support contact details must be verified before publication. |

## Decisions to validate before launch

- Service boundaries, operating hours, response targets, appointment rules, and emergency exclusions.
- Technician evidence, consent, verification renewal, eligibility, and engagement/commission arrangements.
- Currency, prices, taxes, invoice issuer, required invoice fields, settlement responsibilities, and commission accounting.
- Cancellation/call-out charges, quote validity, refunds, disputes, warranty/rework, and escalation timelines.
- Privacy notice, consent, retention/deletion periods, incident handling, and applicable local obligations with appropriate professional advice.
- Who can appoint administrators, how the first administrator is securely provisioned, and how account recovery is handled.

The design does not assert legal compliance or establish binding commercial terms. These unresolved decisions are launch gates, not reasons to invent defaults throughout the application.
