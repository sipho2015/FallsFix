import type { Prisma } from "../../../generated/prisma/client";

export async function deleteEligibleJobPhotos(tx: Prisma.TransactionClient, jobId: string, now = new Date(), apply = false) {
  // Share the job lock with complaint/refund/rework operations and photo uploads.
  await tx.$queryRaw`SELECT id FROM "Job" WHERE id = ${jobId}::uuid FOR UPDATE`;
  const job = await tx.job.findUnique({ where: { id: jobId }, include: {
    complaints: { where: { status: { not: "RESOLVED" } } },
    documents: { include: { refund: true } },
  } });
  if (!job?.completedNotifiedAt || !job.reworkUntil || job.reworkUntil >= now ||
      !["COMPLETED", "CLOSED"].includes(job.status) || job.reworkActive || job.retentionReason ||
      job.complaints.length || job.documents.some(d => d.refund && !d.refund.paidAt)) return 0;
  // New evidence also gets at least three days; never erase a newly submitted photo immediately.
  const where = { jobId, createdAt: { lt: new Date(+now - 3 * 86400000) } };
  if (!apply) return tx.jobPhoto.count({ where });
  return (await tx.jobPhoto.deleteMany({ where })).count;
}
