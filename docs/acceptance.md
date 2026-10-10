# Browser and operator acceptance

Use a separate preview database with synthetic users and job evidence. Never put identity documents or customer data in public screenshots. Record the release, date, browser, viewport, outcome and any blocking defect for each check. Automated HTTP checks cover server rendering and permissions; the checks below still require an interactive browser and operators.

## Screen checks

Check at 360, 768, 1280 and 1920 pixels, including a long name/email and long request descriptions.

| Screen | Acceptance evidence |
| --- | --- |
| Public pages | Navigation and mobile menu work; catalogue images load; no page-wide horizontal overflow; request form gives useful validation and retry feedback. |
| Account | Correct role cards appear; email wraps; sign-out works; removed/suspended roles cannot regain access through an old tab. |
| Customer | Overview shows recent owned requests; every tab works; request pagination preserves its tab; unread updates can be marked read; profile saves; submitted technician application has an honest status. |
| Administrator | Sidebar and narrow-screen navigation work; each section opens directly by URL; search/report filters retain their section; request table scrolls within its container; expandable verification/settings forms work. |
| Technician | Only current assignments reveal customer details; acceptance/decline and progress changes work; ended assignments retain limited history and deny private job/photo access. |
| Job and invoice | Quote revisions/decisions, private photos, history, complaints and completion are usable; invoice print preview includes approved lines and totals without navigation; blank optional legal identifiers are omitted. |

Navigate with keyboard only. Verify the skip link, visible focus, tab order, menus, details controls, form labels, disabled saving state and screen-reader status feedback. Check 200% zoom, browser back/forward, refresh and a lost connection during submission. Retry must preserve entered data and avoid duplicate requests or receipts. Record browser console errors and resolve application errors before acceptance.

## Synthetic service journey

1. Register and verify a customer using preview email delivery. Submit a request and photo, then confirm another customer cannot access either.
2. As a preview administrator, review the request, record technician verification evidence, activate preview coverage and assign a verified technician.
3. As that technician, accept and assess. Prepare a quote with separate labour, materials and call-out lines, including an explicit zero line if waived. Confirm dispatch stays blocked until customer approval.
4. Approve as customer, schedule and progress the visit, request completion confirmation and complete. Verify the durable completion notification and three-day rework window.
5. Issue the invoice and reconcile its immutable issuer/job snapshots, currency, totals and labour-only 75/25 allocation. Record partial/full manual receipts; retry a receipt and reverse a mistaken receipt without duplicating money.
6. Submit a review and a timely complaint. Approve/finish rework with recorded customer agreement. Confirm unresolved complaints/rework protect photos and prevent premature closure.
7. On a separate failed-repair job, reconcile eligible actual receipts and approved excluded costs; approve the 65% settlement and record its disbursement separately. Confirm originals remain intact and closure stays blocked until obligations are resolved.
8. Compare reports against those invoice/receipt/refund records by currency. Run photo cleanup in dry-run mode and verify held evidence remains protected.

## Hosted acceptance

Follow [deployment](deployment.md): verify actual HTTPS/proxy headers, SMTP registration/recovery delivery, health monitoring, storage limits, retention scheduling, encrypted backups and an isolated restore. The intended owner must register and verify before administrator provisioning and prepared owner settings are applied.

An operator must then run the agreed real pilot, reconcile invoices/refunds and technician payouts, confirm support/privacy arrangements and record a launch decision. Keep noindex until that decision. Local synthetic acceptance does not establish real technician coverage or complete the pilot.
