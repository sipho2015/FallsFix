import type { Prisma, JobStatus } from "../../database/generated/prisma/client";
import { hasRole, loadPrincipal } from "../authorization/policy";
import { operationSchema, minorUnits, localDate } from "@/shared/validation/operations";
import { failureRefund, invoiceBalance, invoiceSettingLabels, type ChargeLine } from "@/shared/validation/commercial";
export class OperationError extends Error { constructor(message: string, public status = 400) { super(message); } }
const ensure: (condition: unknown, message: string, status?: number) => asserts condition = (condition, message, status) => { if (!condition) throw new OperationError(message, status); };
export async function executeOperation(tx: Prisma.TransactionClient, userId: string, input: unknown) {
  const parsed = operationSchema.safeParse(input);
  ensure(parsed.success, parsed.error?.issues[0]?.message ?? "Invalid input.");
  const op = parsed.data;
  const principal = await loadPrincipal(tx, userId);
  ensure(principal, "Sign in with a verified account.", 401);
  const admin = hasRole(principal, "ADMIN");
  const customer = hasRole(principal, "CUSTOMER");
  const audit = (detail: string, targetId = userId) => tx.auditEvent.create({ data: { actorId: userId, action: op.action, targetId, detail } });
  if (op.action === "profile") {
    await tx.user.update({ where: { id: userId }, data: { name: op.name, phone: op.phone } });
    if (customer) await tx.customerProfile.update({ where: { userId }, data: { businessName: op.businessName } });
    if (hasRole(principal, "TECHNICIAN")) await tx.technicianProfile.update({ where: { userId }, data: { bio: op.bio } });
    return { message: "Profile saved." };
  }
  if (op.action === "readNotification") {
    await tx.notification.updateMany({ where: { id: op.notificationId, userId }, data: { readAt: new Date() } });
    return { message: "Notification marked as read." };
  }
  if (op.action === "application") {
    ensure(customer, "A customer account is required.", 403);
    ensure(await tx.serviceCategory.findUnique({ where: { id: op.categoryId } }), "Select a service.");
    ensure(!await tx.technicianApplication.findUnique({ where: { userId } }), "Your application has already been received.");
    await tx.technicianApplication.create({ data: { userId, bio: op.bio, phone: op.phone, categoryId: op.categoryId } });
    return { message: "Application received. An administrator will review it; technician access is not yet enabled." };
  }
  if (op.action === "catalogue" || op.action === "setting" || op.action === "verifyTechnician" || op.action === "suspend" || op.action === "role" || op.action === "technicianAccess") {
    ensure(admin, "Administrator access required.", 403);
    if (op.action === "role" || op.action === "suspend") {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(721032945)::text`;
      const current = await loadPrincipal(tx, userId);
      ensure(current && hasRole(current, "ADMIN"), "Administrator access was revoked.", 403);
    }
    if (op.action === "role") {
      ensure(op.userId !== userId, "Another administrator must change your roles.");
      const target = await tx.user.findUnique({ where: { id: op.userId } });
      ensure(target?.emailVerified && target.status === "ACTIVE", "An active verified account is required.");
      if (op.grant) await tx.userRole.upsert({ where: { userId_role: { userId: op.userId, role: op.role } }, create: { userId: op.userId, role: op.role }, update: {} });
      else await tx.userRole.deleteMany({ where: { userId: op.userId, role: op.role } });
      await tx.session.deleteMany({ where: { userId: op.userId } });
    }
    if (op.action === "technicianAccess") {
      ensure(op.userId !== userId, "Another administrator must change your technician access.");
      const profile = await tx.technicianProfile.findUnique({ where: { userId: op.userId } });
      ensure(profile?.verificationStatus === "VERIFIED", "Verify this technician first.");
      await tx.technicianProfile.update({ where: { userId: op.userId }, data: { isActive: op.active } });
      await tx.session.deleteMany({ where: { userId: op.userId } });
    }
    if (op.action === "catalogue") await tx.serviceCategory.update({ where: { id: op.categoryId }, data: { isActive: op.isActive } });
    if (op.action === "setting") {
      ensure(!["invoiceIssuer", "invoiceAddress"].includes(op.key) || op.value.length > 0, "Invoice name and address cannot be empty.");
      ensure(op.key !== "requestIntake" || ["open", "closed"].includes(op.value), "Use open or closed.");
      await tx.businessSetting.upsert({ where: { key: op.key }, create: { key: op.key, value: op.value }, update: { value: op.value } });
    }
    if (op.action === "suspend") {
      ensure(op.userId !== userId, "You cannot suspend your own account.");
      await tx.user.update({ where: { id: op.userId }, data: { status: op.suspended ? "SUSPENDED" : "ACTIVE" } });
      await tx.session.deleteMany({ where: { userId: op.userId } });
    }
    if (op.action === "verifyTechnician") {
      ensure(!op.identityEvidence.includes("/api/photos/") && !op.profilePhotoEvidence.includes("/api/photos/"), "Job photos are not technician verification evidence.");
      const verificationEvidence = { identityType: op.identityType, identityEvidence: op.identityEvidence, phone: op.phone, profilePhotoEvidence: op.profilePhotoEvidence, serviceArea: op.serviceArea, competenceEvidence: op.competenceEvidence || "Not available; administrator review recorded", categoryId: op.categoryId };
      const applicant = await tx.user.findUnique({ where: { id: op.userId } });
      ensure(applicant?.emailVerified && applicant.status === "ACTIVE", "An active verified account is required.");
      const area = await tx.serviceArea.findUnique({ where: { slug: "victoria-falls" } });
      ensure(area, "Service area missing.");
      await tx.technicianProfile.upsert({ where: { userId: op.userId }, create: { userId: op.userId, verificationEvidence, isActive: true, verificationStatus: "VERIFIED", verifiedById: userId, verifiedAt: new Date() }, update: { verificationEvidence, isActive: true, verificationStatus: "VERIFIED", verifiedById: userId, verifiedAt: new Date() } });
      await tx.userRole.upsert({ where: { userId_role: { userId: op.userId, role: "TECHNICIAN" } }, create: { userId: op.userId, role: "TECHNICIAN" }, update: {} });
      await tx.technicianSkill.upsert({ where: { technicianId_categoryId: { technicianId: op.userId, categoryId: op.categoryId } }, create: { technicianId: op.userId, categoryId: op.categoryId }, update: {} });
      await tx.technicianServiceArea.upsert({ where: { technicianId_serviceAreaId: { technicianId: op.userId, serviceAreaId: area.id } }, create: { technicianId: op.userId, serviceAreaId: area.id }, update: {} });
      await tx.user.update({ where: { id: op.userId }, data: { phone: op.phone } });
      await tx.technicianApplication.updateMany({ where: { userId: op.userId }, data: { status: "VERIFIED" } });
    }
    await audit(op.reason, "userId" in op ? op.userId : "categoryId" in op ? op.categoryId : op.key);
    return { message: "Changes saved and audited." };
  }
  if (op.action === "request") {
    ensure(customer, "A customer account is required.", 403);
    const existing = await tx.job.findUnique({ where: { requestKey: op.requestKey }, include: { location: true, category: true } });
    if (existing) { ensure(existing.customerId === userId && existing.description === op.description && existing.category.slug === op.category && existing.location?.addressLine === op.addressLine && existing.location?.locality === op.locality && existing.location?.contactName === op.contactName && existing.location?.contactPhone === op.contactPhone && (existing.location?.directions ?? "") === (op.directions ?? "") && (existing.preferredAt ? +existing.preferredAt : 0) === (op.preferredAt ? +localDate(op.preferredAt) : 0), "Request key already used for different details.", 409); return { jobId: existing.id, message: `Request FF-${existing.reference} received.` }; }
    const intake = await tx.businessSetting.findUnique({ where: { key: "requestIntake" } });
    ensure(intake?.value !== "closed", "Request intake is temporarily closed. Please contact us.");
    const category = await tx.serviceCategory.findUnique({ where: { slug: op.category } });
    const area = await tx.serviceArea.findUnique({ where: { slug: "victoria-falls" } });
    ensure(category && area, "This service is unavailable. Please contact us.");
    const preferredAt = op.preferredAt ? localDate(op.preferredAt) : null;
    ensure(!preferredAt || (Number.isFinite(+preferredAt) && preferredAt > new Date()), "Choose a future preferred time.");
    const saved = await tx.job.create({ data: { customerId: userId, categoryId: category.id, serviceAreaId: area.id, requestKey: op.requestKey, description: op.description, preferredAt, location: { create: { addressLine: op.addressLine, locality: op.locality, directions: op.directions, contactName: op.contactName, contactPhone: op.contactPhone } }, history: { create: { actorId: userId, toStatus: "REQUESTED", reason: "Customer submitted a request for review; appointment and availability are unconfirmed." } } } });
    await tx.notification.create({ data: { userId, jobId: saved.id, message: `Request FF-${saved.reference} received for review.` } });
    const operators = await tx.user.findMany({ where: { status: "ACTIVE", emailVerified: true, roles: { some: { role: "ADMIN" } } }, select: { id: true } });
    if (operators.length) await tx.notification.createMany({ data: operators.map(u => ({ userId: u.id, jobId: saved.id, message: "New service request awaiting review." })) });
    return { jobId: saved.id, message: `Request FF-${saved.reference} received.` };
  }
  await tx.$queryRaw`SELECT id FROM "Job" WHERE id = ${op.jobId}::uuid FOR UPDATE`;
  const job = await tx.job.findUnique({ where: { id: op.jobId }, include: { assignments: { where: { endedAt: null } }, documents: { orderBy: { revision: "desc" }, include: { payments: true, refund: true } }, complaints: true, appointments: true } });
  ensure(job, "Request not found.", 404);
  const owner = customer && job.customerId === userId;
  const assignment = job.assignments[0];
  const technician = hasRole(principal, "TECHNICIAN") && assignment?.technicianId === userId;
  ensure(admin || owner || technician, "Request not found.", 404);
  if (op.action === "payment") {
    ensure(admin, "Administrator access required.", 403);
    const prior = await tx.payment.findUnique({ where: { operationId: op.operationId } });
    if (prior) { ensure(prior.documentId === op.documentId && prior.amount === minorUnits(op.amount) && prior.currency === op.currency && prior.method === op.method && prior.reference === op.reference && +prior.receivedAt === +localDate(op.receivedAt), "Payment retry differs from the original.", 409); return { jobId: job.id, message: "Payment already recorded." }; }
  }
  if (op.action === "approveRefund") {
    ensure(admin, "Administrator access required.", 403);
    const prior = job.documents.find(d => d.id === op.documentId)?.refund;
    if (prior) {
      ensure(prior.operationId === op.operationId && prior.excludedPaid === minorUnits(op.excludedPaid) && prior.excludedCosts === op.excludedCosts && prior.reason === op.reason, "Refund decision differs from the original.", 409);
      return { jobId: job.id, message: "Refund decision already recorded." };
    }
  }
  if (op.action === "payRefund") {
    ensure(admin, "Administrator access required.", 403);
    const prior = job.documents.find(d => d.refund?.id === op.refundId)?.refund;
    if (prior?.paidAt) {
      ensure(+prior.paidAt === +localDate(op.paidAt) && prior.method === op.method && prior.reference === op.reference, "Refund payment differs from the original.", 409);
      return { jobId: job.id, message: "Refund payment already recorded." };
    }
  }
  ensure(job.version === op.version, "This request changed. Refresh the page before trying again.", 409);
  ensure(job.status !== "CLOSED" || ["review", "moderateReview", "complaint", "resolveComplaint", "retentionHold", "finishRework", "approveRefund", "payRefund"].includes(op.action), "This job is closed.");
  let next: JobStatus = job.status;
  let reason = "reason" in op ? op.reason ?? op.action : op.action;
  const approved = job.documents.find(d => d.kind === "QUOTE" && d.status === "APPROVED");
  const invoice = job.documents.find(d => d.kind === "INVOICE" && d.status === "ISSUED");
  const inState = (...states: JobStatus[]) => ensure(states.includes(job.status), "This action is not available at the current stage.", 409);
  switch (op.action) {
    case "reviewRequest": ensure(admin, "Administrator access required.", 403); inState("REQUESTED"); next = "UNDER_REVIEW"; break;
    case "assign": {
      ensure(admin, "Administrator access required.", 403); inState("UNDER_REVIEW", "TECHNICIAN_ASSIGNED", "ACCEPTED", "ASSESSING");
      const eligible = await tx.technicianProfile.findFirst({ where: { userId: op.technicianId, isActive: true, verificationStatus: "VERIFIED", user: { status: "ACTIVE", emailVerified: true, roles: { some: { role: "TECHNICIAN" } } }, skills: { some: { categoryId: job.categoryId } }, serviceAreas: { some: { serviceAreaId: job.serviceAreaId } } } });
      ensure(eligible, "Choose a verified technician with this service and area.");
      const category = await tx.serviceCategory.findUnique({ where: { id: job.categoryId } });
      ensure(category?.isActive, "Activate this category after confirming coverage.");
      await tx.jobAssignment.updateMany({ where: { jobId: job.id, endedAt: null }, data: { status: "REPLACED", endedAt: new Date(), reason: op.reason } });
      await tx.jobAssignment.create({ data: { jobId: job.id, technicianId: op.technicianId, assignedById: userId } });
      await tx.notification.create({ data: { userId: op.technicianId, jobId: job.id, message: `You have a new assignment: FF-${job.reference}.` } });
      next = "TECHNICIAN_ASSIGNED"; break;
    }
    case "accept": case "decline":
      ensure(technician && assignment?.status === "PENDING", "Current pending assignment required.", 403); inState("TECHNICIAN_ASSIGNED");
      await tx.jobAssignment.update({ where: { id: assignment.id }, data: { status: op.action === "accept" ? "ACCEPTED" : "DECLINED", respondedAt: new Date(), ...(op.action === "decline" ? { endedAt: new Date(), reason: op.reason } : {}) } });
      next = op.action === "accept" ? "ACCEPTED" : "UNDER_REVIEW"; break;
    case "progress": {
      ensure(technician && assignment?.status === "ACCEPTED", "Current accepted assignment required.", 403);
      const transitions: Record<string, JobStatus> = { ASSESSING: "ACCEPTED", ON_THE_WAY: "SCHEDULED", ARRIVED: "ON_THE_WAY", IN_PROGRESS: "ARRIVED", AWAITING_CUSTOMER_CONFIRMATION: "IN_PROGRESS" };
      inState(transitions[op.status]);
      if (op.status !== "ASSESSING") ensure(approved, "Customer-approved scope is required.");
      if (op.status === "ON_THE_WAY") ensure((approved?.lines as ChargeLine[]).some(l => l.type === "CALLOUT"), "Customer must approve an explicit call-out charge (including any agreed waiver) before dispatch.");
      next = op.status; break;
    }
    case "cancel":
      ensure(owner || admin, "Customer or administrator access required.", 403);
      ensure(!await tx.jobStatusHistory.count({ where: { jobId: job.id, toStatus: "IN_PROGRESS" } }) && !["IN_PROGRESS", "AWAITING_CUSTOMER_CONFIRMATION", "COMPLETED", "CANCELLED", "CLOSED"].includes(job.status), "Contact support to resolve work already started.");
      await tx.jobAssignment.updateMany({ where: { jobId: job.id, endedAt: null }, data: { status: "CANCELLED", endedAt: new Date(), reason: op.reason } });
      await tx.jobAppointment.updateMany({ where: { jobId: job.id, status: { in: ["PROPOSED", "CONFIRMED"] } }, data: { status: "CANCELLED" } });
      next = "CANCELLED"; break;
    case "note":
      ensure(op.visibility === "CUSTOMER" || admin || technician, "Internal notes are restricted.", 403);
      await tx.jobNote.create({ data: { jobId: job.id, authorId: userId, body: op.body, visibility: op.visibility } }); break;
    case "quote": {
      ensure(admin, "Administrator access required.", 403); inState("ACCEPTED", "ASSESSING", "AWAITING_QUOTE_APPROVAL", "IN_PROGRESS");
      const expiresAt = new Date(Date.now() + 14 * 86400000);
      const lines = op.lines.map(l => ({ type: l.type, description: l.description, quantity: l.quantity, unitAmount: minorUnits(l.unitAmount) }));
      const total = lines.reduce((sum,l) => sum + l.quantity * l.unitAmount, 0); ensure(Number.isSafeInteger(total) && total <= 2_000_000_000, "Quote amount exceeds supported limits.");
      ensure(!approved || approved.currency === op.currency, "Revisions must use the same currency.");
      const draft = job.documents.find(d => d.kind === "QUOTE" && d.status === "DRAFT");
      const revision = draft?.revision ?? Math.max(0, ...job.documents.filter(d => d.kind === "QUOTE").map(d => d.revision)) + 1;
      if (op.send) await tx.jobDocument.updateMany({ where: { jobId: job.id, kind: "QUOTE", status: { in: ["SENT", "APPROVED"] } }, data: { status: "SUPERSEDED" } });
      const data = { status: op.send ? "SENT" : "DRAFT", currency: op.currency, total, lines, scope: op.scope, expiresAt };
      if (draft) await tx.jobDocument.update({ where: { id: draft.id }, data });
      else await tx.jobDocument.create({ data: { ...data, jobId: job.id, kind: "QUOTE", revision } });
      if (op.send) next = "AWAITING_QUOTE_APPROVAL";
      break;
    }
    case "sendQuote": {
      ensure(admin, "Administrator access required.", 403); inState("ASSESSING", "AWAITING_QUOTE_APPROVAL", "IN_PROGRESS");
      const draft = job.documents.find(d => d.id === op.documentId && d.kind === "QUOTE" && d.status === "DRAFT");
      ensure(draft?.expiresAt && draft.expiresAt > new Date(), "Edit the draft with a future expiry before sending.");
      ensure(!approved || approved.currency === draft.currency, "Revisions must use the same currency.");
      await tx.jobDocument.updateMany({ where: { jobId: job.id, kind: "QUOTE", status: { in: ["SENT", "APPROVED"] } }, data: { status: "SUPERSEDED" } });
      await tx.jobDocument.update({ where: { id: draft.id }, data: { status: "SENT", expiresAt: new Date(Date.now() + 14 * 86400000) } });
      next = "AWAITING_QUOTE_APPROVAL"; break;
    }
    case "quoteDecision": {
      ensure(owner, "Only the owning customer can decide a quote.", 403); inState("AWAITING_QUOTE_APPROVAL");
      const quote = job.documents.find(d => d.id === op.documentId && d.kind === "QUOTE" && d.status === "SENT");
      ensure(quote?.expiresAt && quote.expiresAt > new Date(), "Quote is expired or superseded. Ask for a new revision.");
      await tx.jobDocument.update({ where: { id: quote.id }, data: { status: op.approve ? "APPROVED" : "REJECTED", decidedAt: new Date(), decidedBy: userId } });
      next = op.approve ? (await tx.jobStatusHistory.count({ where: { jobId: job.id, toStatus: "IN_PROGRESS" } }) ? "IN_PROGRESS" : "READY_TO_SCHEDULE") : "ASSESSING"; break;
    }
    case "schedule": {
      ensure(admin, "Administrator access required.", 403);
      if (op.purpose === "WORK" || approved) { inState("READY_TO_SCHEDULE", "SCHEDULED"); ensure(approved, "Approved scope required."); next = "SCHEDULED"; }
      else { throw new OperationError("Quote the call-out fee and obtain customer approval before scheduling an assessment visit."); }
      ensure(assignment?.status === "ACCEPTED", "An accepted assignment is required.");
      const startsAt = localDate(op.startsAt), endsAt = localDate(op.endsAt);
      ensure(Number.isFinite(+startsAt) && Number.isFinite(+endsAt) && startsAt > new Date() && endsAt > startsAt, "Choose a valid future appointment.");
      await tx.$queryRaw`SELECT "userId" FROM "TechnicianProfile" WHERE "userId" = ${assignment.technicianId}::uuid FOR UPDATE`;
      const overlap = await tx.jobAppointment.count({ where: { jobId: { not: job.id }, status: "CONFIRMED", startsAt: { lt: endsAt }, endsAt: { gt: startsAt }, job: { assignments: { some: { technicianId: assignment.technicianId, endedAt: null } } } } });
      ensure(!overlap, "The technician has an overlapping appointment.", 409);
      await tx.jobAppointment.updateMany({ where: { jobId: job.id, purpose: op.purpose, status: "CONFIRMED" }, data: { status: "CANCELLED" } });
      await tx.jobAppointment.create({ data: { jobId: job.id, createdById: userId, purpose: op.purpose, status: "CONFIRMED", startsAt, endsAt } }); break;
    }
    case "confirm": ensure(owner, "Only the owning customer can confirm.", 403); inState("AWAITING_CUSTOMER_CONFIRMATION"); ensure(!job.complaints.some(c => c.status !== "RESOLVED"), "Resolve the open complaint first."); next = "COMPLETED"; await tx.job.update({ where: { id: job.id }, data: { completedNotifiedAt: new Date(), reworkUntil: new Date(Date.now() + 3 * 86400000) } }); break;
    case "complaint": ensure(owner, "Only the owning customer can open a complaint.", 403); await tx.complaint.create({ data: { jobId: job.id, body: op.body } }); break;
    case "resolveComplaint": {
      ensure(admin, "Administrator access required.", 403);
      ensure(job.complaints.some(c => c.id === op.complaintId && c.status !== "RESOLVED"), "Open complaint not found.");
      if (op.outcome === "REWORK") {
        if (["COMPLETED", "CLOSED"].includes(job.status)) {
          const complaint = job.complaints.find(c => c.id === op.complaintId)!;
          ensure(job.reworkUntil && complaint.createdAt <= job.reworkUntil, "Free rework must be requested within three days of completion notification.");
          await tx.job.update({ where: { id: job.id }, data: { reworkActive: true } });
        } else {
          inState("AWAITING_CUSTOMER_CONFIRMATION"); ensure(approved && assignment?.status === "ACCEPTED", "Approved scope and current assignment required."); next = "IN_PROGRESS";
        }
      }
      await tx.complaint.update({ where: { id: op.complaintId }, data: { status: "RESOLVED", resolution: op.resolution, ownerId: userId, resolvedAt: new Date() } }); reason = op.resolution; break;
    }
    case "invoice": {
      ensure(admin, "Administrator access required.", 403);
      if (op.failureSettlement) {
        inState("IN_PROGRESS", "AWAITING_CUSTOMER_CONFIRMATION"); ensure(op.reason && op.reason.length >= 10, "Record the technician failure and customer settlement discussion.");
        next = "CANCELLED";
        await tx.jobAssignment.updateMany({ where: { jobId: job.id, endedAt: null }, data: { status: "CANCELLED", endedAt: new Date(), reason: op.reason } });
        await tx.jobAppointment.updateMany({ where: { jobId: job.id, status: "CONFIRMED" }, data: { status: "CANCELLED" } });
        await tx.job.update({ where: { id: job.id }, data: { retentionReason: "Failed repair settlement: retain evidence until refund/dispute is resolved and retention is reviewed." } });
      } else inState("COMPLETED"); ensure(approved && !invoice, "An approved quote and no existing invoice are required.");
      const issuer = await tx.businessSetting.findUnique({ where: { key: "invoiceIssuer" } });
      const address = await tx.businessSetting.findUnique({ where: { key: "invoiceAddress" } });
      ensure(issuer?.value && address?.value, "Configure the invoice issuer and address before issuing invoices.");
      await tx.jobDocument.create({ data: { jobId: job.id, kind: "INVOICE", revision: 1, status: "ISSUED", currency: approved.currency, total: approved.total, lines: approved.lines as Prisma.InputJsonValue, scope: `${issuer.value}\n${address.value}\n\n${op.failureSettlement ? "Failed repair settlement against agreed scope, not confirmation of completed work. " + op.reason + "\n" : ""}${approved.scope}`, issuerSnapshot: Object.fromEntries((await tx.businessSetting.findMany({ where: { key: { in: Object.keys(invoiceSettingLabels) } } })).map(s => [s.key, s.value])), technicianSnapshot: assignment ? (await tx.user.findUniqueOrThrow({ where: { id: assignment.technicianId }, select: { name: true } })).name : null } }); break;
    }
    case "payment": {
      ensure(admin, "Administrator access required.", 403); inState("COMPLETED", "CANCELLED"); ensure(invoice?.id === op.documentId && !invoice.refund && invoice.currency === op.currency, "Invoice or currency mismatch.");
      const paid = invoice.payments.filter(p => !p.reversedAt).reduce((s,p) => s + p.amount, 0), amount = minorUnits(op.amount);
      ensure(amount > 0 && amount <= invoice.total - paid, "Amount must be positive and cannot exceed the balance.");
      const receivedAt = localDate(op.receivedAt); ensure(Number.isFinite(+receivedAt) && receivedAt <= new Date(), "Use the actual payment receipt time.");
      await tx.payment.create({ data: { documentId: invoice.id, operationId: op.operationId, amount, currency: op.currency, method: op.method, reference: op.reference, actorId: userId, receivedAt } }); break;
    }
    case "reversePayment": {
      ensure(admin, "Administrator access required.", 403); inState("COMPLETED", "CANCELLED");
      ensure(!invoice?.refund, "A refund-approved invoice is frozen; do not reverse its payment basis.");
      const payment = invoice?.payments.find(p => p.id === op.paymentId && !p.reversedAt); ensure(payment, "Valid payment not found.");
      await tx.payment.update({ where: { id: payment.id }, data: { reversedAt: new Date(), reason: op.reason } }); break;
    }
    case "retentionHold":
      ensure(admin, "Administrator access required.", 403);
      await tx.job.update({ where: { id: job.id }, data: { retentionReason: op.holdReason || null } }); break;
    case "finishRework":
      ensure(admin, "Administrator access required.", 403); ensure(job.reworkActive, "No active rework.");
      await tx.job.update({ where: { id: job.id }, data: { reworkActive: false } }); break;
    case "approveRefund": {
      ensure(admin, "Administrator access required.", 403);
      ensure(invoice?.id === op.documentId, "Issued invoice required.");
      if (invoice.refund) {
        ensure(invoice.refund.operationId === op.operationId && invoice.refund.excludedPaid === minorUnits(op.excludedPaid) && invoice.refund.reason === op.reason && invoice.refund.excludedCosts === op.excludedCosts, "A refund decision already exists.", 409);
        break;
      }
      const paid = invoice.payments.filter(p => !p.reversedAt).reduce((s,p) => s+p.amount, 0), excludedPaid = minorUnits(op.excludedPaid);
      ensure(paid > 0 && excludedPaid < paid, "Eligible money actually received must be positive; excluded costs cannot exceed receipts.");
      const calculation = failureRefund(paid, excludedPaid, invoice.total);
      ensure(calculation.amount > 0, "Refund rounds to zero; review the eligible amount.");
      await tx.jobRefund.create({ data: { documentId: invoice.id, operationId: op.operationId, paidSnapshot: paid, excludedPaid, ...calculation, reason: op.reason, excludedCosts: op.excludedCosts, approvedById: userId } });
      break;
    }
    case "payRefund": {
      ensure(admin, "Administrator access required.", 403);
      const refund = invoice?.refund; ensure(refund?.id === op.refundId, "Approved refund not found.");
      const paidAt = localDate(op.paidAt); ensure(Number.isFinite(+paidAt) && paidAt <= new Date() && +paidAt >= Math.floor(+refund.approvedAt / 60000) * 60000, "Record an actual refund after approval.");
      if (refund.paidAt) { ensure(+refund.paidAt === +paidAt && refund.method === op.method && refund.reference === op.reference, "Refund already paid with different details.", 409); break; }
      await tx.jobRefund.update({ where: { id: refund.id }, data: { paidAt, method: op.method, reference: op.reference } }); break;
    }
    case "review": ensure(owner, "Only the owning customer can review.", 403); inState("COMPLETED", "CLOSED"); ensure(!await tx.jobReview.findUnique({ where: { jobId: job.id } }), "You have already reviewed this job."); await tx.jobReview.create({ data: { jobId: job.id, rating: op.rating, body: op.body } }); break;
    case "moderateReview": ensure(admin, "Administrator access required.", 403); await tx.jobReview.update({ where: { jobId: job.id }, data: { hidden: true, reason: op.reason } }); break;
    case "close": {
      ensure(admin, "Administrator access required.", 403); inState("COMPLETED", "CANCELLED"); ensure(!job.complaints.some(c => c.status !== "RESOLVED"), "Resolve open complaints first.");
      ensure(!job.reworkActive, "Finish active rework first.");
      ensure(invoice && invoiceBalance(invoice).balance === 0 && !invoiceBalance(invoice).refundDue, "Issue and settle the invoice before closure (including explicit zero-charge invoices).");
      await tx.jobAssignment.updateMany({ where: { jobId: job.id, endedAt: null }, data: { status: "FINISHED", endedAt: new Date() } }); next = "CLOSED"; break;
    }
  }
  await tx.job.update({ where: { id: job.id }, data: { status: next, version: { increment: 1 } } });
  if (next !== job.status) await tx.jobStatusHistory.create({ data: { jobId: job.id, actorId: userId, fromStatus: job.status, toStatus: next, reason } });
  if (next === "COMPLETED") await tx.jobAppointment.updateMany({ where: { jobId: job.id, status: "CONFIRMED" }, data: { status: "COMPLETED" } });
  await audit(reason, job.id);
  await tx.notification.create({ data: { userId: job.customerId, jobId: job.id, message: `FF-${job.reference}: ${op.action === "confirm" ? "completed. Your three-day free rework request period starts now" : next !== job.status ? next.toLowerCase().replaceAll("_", " ") : "request updated"}.` } });
  return { jobId: job.id, message: "Saved successfully." };
}
