import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePrincipal } from "@/backend/authorization/server";
import { hasRole } from "@/backend/authorization/policy";
import { jobDetail, dateText } from "@/backend/operations/queries";
import { BrandLogo } from "@/frontend/components/brand-logo";
import { PrintInvoice } from "@/frontend/components/photo-upload";
import { formatMoney } from "@/shared/validation/operations";
import { invoiceBalance, invoiceSettingLabels, type ChargeLine } from "@/shared/validation/commercial";
export const metadata: Metadata = { title: "Invoice" };
export const dynamic = "force-dynamic";
export default async function InvoicePage({params}:{params:Promise<{id:string}>}) {
  const principal=await requirePrincipal(), {id}=await params, job=await jobDetail(principal,id);
  if(!job || (!hasRole(principal,"ADMIN") && (!hasRole(principal,"CUSTOMER") || job.customerId!==principal.user.id))) notFound();
  const invoice=job.documents.find(d=>d.kind==="INVOICE" && d.status==="ISSUED"); if(!invoice) notFound();
  const summary=invoiceBalance(invoice), issuer=invoice.issuerSnapshot as Record<string,string> | null;
  return <main id="main-content" tabIndex={-1} className="shell page-content">
    <div style={{width:220}}><BrandLogo/></div><h1>Invoice FF-{job.reference}</h1>
    <p>Issued {dateText(invoice.createdAt)} | Job FF-{job.reference}</p>
    {issuer && Object.entries(invoiceSettingLabels).map(([key,label])=>issuer[key] && <p key={key}>{label.replace(" (optional)","")}: {issuer[key]}</p>)}
    <p>Technician: {invoice.technicianSnapshot ?? "Not recorded on original invoice"}</p>
    <h2>Service and agreed scope</h2><p className="job-details">{invoice.scope}</p>
    <h2>Bill to</h2><p>{job.location?.contactName}<br/>{job.location?.addressLine}<br/>{job.location?.locality}<br/>{job.location?.contactPhone}</p>
    <div className="table-scroll"><table><thead><tr><th>Type</th><th>Description</th><th>Quantity</th><th>Unit amount</th><th>Total</th></tr></thead><tbody>{(invoice.lines as ChargeLine[]).map((l,i)=><tr key={i}><td>{l.type ?? "Legacy unclassified"}</td><td>{l.description}</td><td>{l.quantity}</td><td>{formatMoney(l.unitAmount,invoice.currency)}</td><td>{formatMoney(l.quantity*l.unitAmount,invoice.currency)}</td></tr>)}</tbody></table></div>
    <p>Original total: {formatMoney(invoice.total,invoice.currency)}</p>
    <p>Adjustments / credits: {formatMoney(summary.credit,invoice.currency)}</p>
    <p>Adjusted total: {formatMoney(invoice.total-summary.credit,invoice.currency)}</p>
    <p>Amount paid: {formatMoney(summary.received,invoice.currency)}</p>
    <p>Refunded: {formatMoney(summary.refunded,invoice.currency)}</p>
    <p>Refund due: {formatMoney(summary.refundDue,invoice.currency)}</p>
    <p>Balance: {formatMoney(summary.balance,invoice.currency)} {summary.balance < 0 && "(owed to customer)"}</p>
    <p>Payment status: {summary.status}</p>
    <h2>Payment records</h2>{!invoice.payments.length && <p>No payments recorded.</p>}{invoice.payments.map(p=><p key={p.id}>{dateText(p.receivedAt)} | {p.method} | {p.reference} | {formatMoney(p.amount,p.currency)} {p.reversedAt && "(reversed)"}</p>)}
    {invoice.refund && <section><h2>Refund / settlement</h2><p>{invoice.refund.reason}</p><p>Excluded paid costs: {formatMoney(invoice.refund.excludedPaid,invoice.currency)}. {invoice.refund.excludedCosts}</p><p>65% of eligible payments {formatMoney(invoice.refund.eligiblePaid,invoice.currency)}: {formatMoney(invoice.refund.amount,invoice.currency)}. Credit includes any waived unpaid amount.</p>{invoice.refund.paidAt && <p>Paid {dateText(invoice.refund.paidAt)} | {invoice.refund.method} | {invoice.refund.reference}</p>}</section>}
    <PrintInvoice/>
  </main>;
}
