import { z } from "zod";
const text = (max: number, min = 1) => z.string().trim().min(min).max(max);
const id = z.uuid();
const money = z.string().regex(/^\d{1,7}(\.\d{1,2})?$/, "Use an amount such as 25.00");
const job = { jobId: id, version: z.coerce.number().int().min(0) };
const reason = text(1000, 3);
const line = z.object({ type: z.enum(["LABOUR", "MATERIALS", "CALLOUT", "OTHER"]), description: text(300), quantity: z.number().int().min(1).max(1000), unitAmount: money }).strict();
export const operationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("request"), requestKey: id, category: text(80), description: text(5000, 10), addressLine: text(300, 5), locality: text(120), directions: text(1000, 0).optional(), contactName: text(120), contactPhone: text(32, 7), preferredAt: z.string().max(40).optional() }).strict(),
  z.object({ action: z.literal("profile"), name: text(120), phone: text(32, 7), businessName: text(160, 0).optional(), bio: text(2000, 0).optional() }).strict(),
  z.object({ action: z.literal("application"), bio: text(2000, 20), phone: text(32, 7), categoryId: id }).strict(),
  z.object({ action: z.literal("catalogue"), categoryId: id, isActive: z.boolean(), reason }).strict(),
  z.object({ action: z.literal("setting"), key: z.enum(["requestIntake", "invoiceIssuer", "invoiceAddress", "invoicePhone", "invoiceEmail", "invoiceRegistration", "invoiceTaxId", "invoiceVat"]), value: text(2000, 0), reason }).strict(),
  z.object({ action: z.literal("verifyTechnician"), userId: id, categoryId: id, identityType: z.enum(["NATIONAL_ID", "PASSPORT"]), identityEvidence: text(500), phone: text(32, 7), profilePhotoEvidence: text(500), serviceArea: z.literal("victoria-falls"), competenceEvidence: text(1000, 0).optional(), reason }).strict(),
  z.object({ action: z.literal("role"), userId: id, role: z.enum(["ADMIN", "TECHNICIAN"]), grant: z.boolean(), reason }).strict(),
  z.object({ action: z.literal("technicianAccess"), userId: id, active: z.boolean(), reason }).strict(),
  z.object({ action: z.literal("suspend"), userId: id, suspended: z.boolean(), reason }).strict(),
  z.object({ action: z.literal("readNotification"), notificationId: id }).strict(),
  z.object({ action: z.literal("reviewRequest"), ...job }).strict(),
  z.object({ action: z.literal("assign"), ...job, technicianId: id, reason }).strict(),
  z.object({ action: z.literal("accept"), ...job }).strict(),
  z.object({ action: z.literal("decline"), ...job, reason }).strict(),
  z.object({ action: z.literal("progress"), ...job, status: z.enum(["ASSESSING", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "AWAITING_CUSTOMER_CONFIRMATION"]), reason }).strict(),
  z.object({ action: z.literal("cancel"), ...job, reason }).strict(),
  z.object({ action: z.literal("note"), ...job, body: text(5000), visibility: z.enum(["CUSTOMER", "INTERNAL"]) }).strict(),
  z.object({ action: z.literal("quote"), ...job, send: z.boolean().default(true), scope: text(5000, 5), currency: z.enum(["USD", "ZAR"]), lines: z.array(line).min(1).max(30), expiresAt: text(40).optional() }).strict(),
  z.object({ action: z.literal("sendQuote"), ...job, documentId: id }).strict(),
  z.object({ action: z.literal("quoteDecision"), ...job, documentId: id, approve: z.boolean() }).strict(),
  z.object({ action: z.literal("schedule"), ...job, purpose: z.enum(["WORK", "ASSESSMENT"]), assessmentNoCharge: z.boolean().optional(), startsAt: text(40), endsAt: text(40), reason }).strict(),
  z.object({ action: z.literal("confirm"), ...job }).strict(),
  z.object({ action: z.literal("complaint"), ...job, body: text(5000, 10) }).strict(),
  z.object({ action: z.literal("resolveComplaint"), ...job, complaintId: id, resolution: text(5000, 10), outcome: z.enum(["RESOLVED", "REWORK"]) }).strict(),
  z.object({ action: z.literal("invoice"), ...job, failureSettlement: z.boolean().optional(), reason: reason.optional() }).strict(),
  z.object({ action: z.literal("payment"), ...job, documentId: id, operationId: id, amount: money, currency: z.enum(["USD", "ZAR", "ZWG"]), method: z.enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "ECOCASH", "SWIPE", "VISA", "OTHER"]), reference: text(160), receivedAt: text(40) }).strict(),
  z.object({ action: z.literal("reversePayment"), ...job, paymentId: id, reason }).strict(),
  z.object({ action: z.literal("review"), ...job, rating: z.coerce.number().int().min(1).max(5), body: text(2000, 5) }).strict(),
  z.object({ action: z.literal("moderateReview"), ...job, reason }).strict(),
  z.object({ action: z.literal("retentionHold"), ...job, holdReason: text(1000, 0), reason }).strict(),
  z.object({ action: z.literal("finishRework"), ...job, reason }).strict(),
  z.object({ action: z.literal("approveRefund"), ...job, documentId: id, operationId: id, excludedPaid: money, excludedCosts: text(2000, 5), reason: text(2000, 10) }).strict(),
  z.object({ action: z.literal("payRefund"), ...job, refundId: id, method: z.enum(["CASH", "BANK_TRANSFER"]), reference: text(160), paidAt: text(40) }).strict(),
  z.object({ action: z.literal("close"), ...job, reason }).strict(),
]);
export type Operation = z.infer<typeof operationSchema>;
export function minorUnits(value: string) { const [whole, fraction = ""] = value.split("."); return Number(whole) * 100 + Number(fraction.padEnd(2, "0")); }
export function formatMoney(value: number, currency: string) { return `${currency} ${(value / 100).toFixed(2)}`; }
export function localDate(value: string) { return new Date(/(Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}:00+02:00`); }
