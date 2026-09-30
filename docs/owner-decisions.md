# Owner decisions

Confirmed by the owner on 2026-09-30. These supersede the preliminary answers from 2026-09-29. They describe business policy, not a claim of legal or tax compliance.

## Administrator, coverage and invoice identity

- Intended first administrator and request/complaint operator: siphomoyo893@gmail.com.
- Coverage: all areas, locations and suburbs of Victoria Falls.
- Currently fulfilled category: Computer and IT support (`it-support`).
- Prepared invoice issuer: FallsFix. Address: 4223 Chinotimba.
- **Keep the prepared invoice identity and IT-only category changes pending until the intended administrator has registered and verified the account.** Do not bootstrap or apply these changes merely because policy development is complete.
- `scripts/apply-owner-settings.ts` remains available for the later audited configuration step. It has not been executed.

## Technician approval

Require National ID/passport, verified phone, a profile photo, service area, and selected skills/services. Review proof of competence where available: qualification/certificate, previous-work evidence, or a reference. Customer problem photos are job evidence and must never be used as technician verification.

Implementation: the administrator reviews original identity/photo evidence through the private verification process and records restricted review references, phone, area, selected skill and competence evidence. Repeat approval for each skill. References are not public links or identity numbers. The application does not yet provide an identity-document upload vault; original-document review is an operator responsibility. Existing verified profiles are preserved; new verification requires the evidence fields.

## Call-out and quotations

- No fixed platform-wide call-out amount.
- Quote each visit based on location, distance, job type and urgency, as applicable.
- Itemize the call-out amount separately. Obtain customer approval before technician dispatch. An agreed waiver is represented explicitly by a zero call-out line, never an omitted price.
- New and newly sent draft quotes are valid for 14 days from sending.
- Labour, materials/parts, call-out and other charges are separate line types. Existing historical documents remain unchanged; legacy lines are unclassified rather than silently treated as labour.
- New quotes use USD or ZAR. Existing documents in other supported legacy currencies can still be settled in their original currency.

## Money and technician allocation

- FallsFix receives customer payments: cash, EcoCash, swipe or Visa. These are manual receipt records; no online card or EcoCash gateway is implied.
- Technician allocation is 75% of LABOUR ONLY; FallsFix allocation is the remaining 25%. Reimbursed materials are excluded. Call-out and other charges are not automatically counted as labour.
- Calculate once on the labour subtotal in integer minor units. Round the technician share to the nearest minor unit and allocate the remainder to FallsFix so totals reconcile.
- Allocation displays are not payout records. Technician payout timing and refund-related payout reconciliation remain an operator responsibility.

## Cancellation, incomplete repair and refund

- Standard cancellation after work starts: no deposit refund.
- Technician inability to complete the agreed repair is an exception, handled through an administrator-approved settlement.
- Where the 65% policy applies, eligible money is actual non-reversed payments received, less separately recorded, previously approved non-refundable costs already paid (such as specifically purchased parts). Refund 65% of that eligible amount, not 65% of the quote.
- Record excluded costs, their prior approval evidence, the failure and the customer settlement agreement. Do not infer excluded costs from a materials label alone.
- The settlement form explicitly credits the refund plus any unpaid charges being waived. Original invoice and receipt amounts are preserved. Approving the settlement freezes its payment basis.
- FallsFix records actual refund disbursement separately, by cash or transfer with date and reference. A receipt reversal corrects a mistaken record; it is not a refund.
- A failed repair can produce a settlement invoice without claiming completion. Record actual deposits/receipts received against it, then approve/pay the settlement. This is manual settlement bookkeeping, not deposit collection or a payment gateway.
- Refund approval and payment retries cannot create duplicate settlements. Closure is blocked until the refund is paid and blocking complaints/rework are resolved.

## Rework and evidence retention

- Free rework period: three days from the atomic Completed transition and durable customer completion notification. Completion notification is currently in-app, not proof of email/SMS delivery or reading.
- A complaint submitted within that period can be approved for free rework even if the operator reviews it after the deadline. Active rework is tracked separately from historical completion and is finished with a recorded customer agreement.
- Supersede the former one-day photo deletion rule. Protect photos through the complete rework window and while any complaint, unpaid refund, rework, fraud investigation or other required retention reason is active.
- Manual retention holds have a reason and audited release. Releasing a manual hold cannot bypass automatic complaint/refund/rework protection.
- The cleanup command defaults to a dry run: `npx tsx scripts/cleanup-job-photos.ts`. Use `--apply` to delete only eligible photos after rechecking protections under the job lock. Newly added evidence also gets at least three days.
- No cleanup has been run in deletion mode and no host schedule has been installed. Schedule this command during deployment. Jobs without a trustworthy completion-notification timestamp remain protected pending review; failed repairs are automatically held.
- Backups are separate protected recovery copies. Their expiry and any restoration must respect holds and re-run retention review before service resumes; this command does not edit backup archives or claim their copies are erased.
- FallsFix handles removal requests. Complaint response target remains immediate operator attention, not an automated response guarantee.

## Invoice fields

Supported: business/legal name, address, optional phone/email and registration/tax/TIN/BPIN/VAT settings, invoice number/date, customer, technician/job reference, scope, typed labour/materials/call-out lines, settlement credits/refunds, total, amounts received/refunded, balance, payment methods and status.

No legal identifiers or tax rates are invented. Optional blank fields are omitted. Issuer and technician details are snapshotted at issuance; later settings changes cannot rewrite an issued invoice. Old invoices retain their original snapshot/text.

## Acceptance still required

Run the customer/admin/technician screen checklist, reconcile sample invoices and refunds, and verify production scheduling/backups. Browser connection currently returns no available sessions. These implementation changes do not mark phases 7-17 or the production launch fully accepted.
