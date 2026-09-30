import { ActionForm } from "./action-form";
import { labourSplit, type ChargeLine } from "@/shared/validation/commercial";
import { formatMoney } from "@/shared/validation/operations";
type SettlementDocument = { id: string; currency: string; lines: unknown; refund: null | {
  id: string; reason: string; excludedPaid: number; excludedCosts: string; eligiblePaid: number;
  amount: number; creditAmount: number; paidAt: Date | null; method: string | null; reference: string | null;
} };
const dateText = (date: Date) => new Intl.DateTimeFormat("en-ZW", {timeZone:"Africa/Harare",dateStyle:"medium",timeStyle:"short"}).format(date) + " CAT";
export function SettlementPanel({ document: d, admin, fixed }: { document: SettlementDocument; admin: boolean; fixed: { jobId: string; version: number } }) {
  const split = labourSplit(d.lines as ChargeLine[]);
  return <div>
    {admin && <p>Labour allocation before refunds: technician {formatMoney(split.technician,d.currency)} (75%); FallsFix {formatMoney(split.fallsfix,d.currency)} (25%). Materials, call-out and other charges are excluded. {split.unclassified && "Legacy unclassified items need review; commission is not inferred."} This is an allocation, not a payout record. {d.refund && "Reconcile technician payout separately after this settlement."}</p>}
    {d.refund && <section><h4>Technician non-completion settlement</h4>
      <p>{d.refund.reason}</p><p>Approved non-refundable costs paid: {formatMoney(d.refund.excludedPaid,d.currency)}. {d.refund.excludedCosts}</p>
      <p>Eligible money received: {formatMoney(d.refund.eligiblePaid,d.currency)}. Refund (65%): {formatMoney(d.refund.amount,d.currency)}. Credit against invoice: {formatMoney(d.refund.creditAmount,d.currency)}, including waived unpaid charges.</p>
      <p>{d.refund.paidAt ? `Refund paid ${dateText(d.refund.paidAt)} by ${d.refund.method}; reference ${d.refund.reference}.` : "Approved refund awaiting payment by FallsFix."}</p>
      {admin && !d.refund.paidAt && <ActionForm action="payRefund" title="Record actual refund payment" fixed={{...fixed,refundId:d.refund.id}} fields={[
        {name:"method",label:"Refund method",options:[{value:"CASH",label:"Cash"},{value:"BANK_TRANSFER",label:"Transfer"}]},
        {name:"reference",label:"Refund receipt / transfer reference"},{name:"paidAt",label:"Paid at (CAT)",type:"datetime-local"},
      ]}/>}
    </section>}
    {admin && !d.refund && <ActionForm action="approveRefund" title="Approve technician non-completion settlement" fixed={{...fixed,documentId:d.id}} fields={[
      {name:"excludedPaid",label:"Approved non-refundable costs already paid (0 if none)",value:"0.00"},
      {name:"excludedCosts",label:"Itemized excluded costs and prior customer approval evidence (state none if zero)",type:"textarea"},
      {name:"reason",label:"Technician failure and customer settlement agreement: waive unpaid charges and refund 65% of eligible receipts",type:"textarea"},
    ]}/>}
  </div>;
}
