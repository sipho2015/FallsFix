export const chargeTypes = ["LABOUR", "MATERIALS", "CALLOUT", "OTHER"] as const;
export type ChargeType = typeof chargeTypes[number];
export type ChargeLine = { description: string; quantity: number; unitAmount: number; type?: ChargeType };
export const invoiceSettingLabels = {
  invoiceIssuer: "Business / legal name",
  invoiceAddress: "Business address",
  invoicePhone: "Business phone (optional)",
  invoiceEmail: "Business email (optional)",
  invoiceRegistration: "Registration number (optional)",
  invoiceTaxId: "Tax / TIN / BPIN identifier (optional)",
  invoiceVat: "VAT identifier (optional)",
} as const;
export function labourSplit(lines: ChargeLine[]) {
  const labour = lines.filter(l => l.type === "LABOUR").reduce((s,l) => s + l.quantity * l.unitAmount, 0);
  // Round technician entitlement once to the nearest minor unit; the remainder stays with FallsFix.
  const technician = Math.floor((labour * 75 + 50) / 100);
  return { labour, technician, fallsfix: labour - technician, unclassified: lines.some(l => !l.type) };
}
export function failureRefund(paid: number, excluded: number, total: number) {
  if (![paid, excluded, total].every(Number.isSafeInteger) || excluded < 0 || excluded >= paid || paid > total) throw new Error("Invalid eligible payment basis");
  const eligiblePaid = paid - excluded;
  const amount = Math.floor((eligiblePaid * 65 + 50) / 100);
  return { eligiblePaid, amount, creditAmount: total - paid + amount };
}
export function invoiceBalance(document: { total: number; payments: { amount: number; reversedAt: Date | null }[]; refund?: { amount: number; creditAmount: number; paidAt: Date | null } | null }) {
  const received = document.payments.filter(p => !p.reversedAt).reduce((s,p) => s + p.amount, 0);
  const refunded = document.refund?.paidAt ? document.refund.amount : 0;
  const credit = document.refund?.creditAmount ?? 0;
  const balance = document.total - credit - received + refunded;
  const refundDue = document.refund && !document.refund.paidAt ? document.refund.amount : 0;
  return { received, refunded, credit, balance, refundDue, status: refundDue ? "REFUND DUE" : balance > 0 ? "PAYMENT DUE" : document.refund ? "REFUNDED / SETTLED" : "PAID" };
}
