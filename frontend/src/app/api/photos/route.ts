import { apiIdentity, apiError, boundedBody, json } from "@/backend/operations/http";
import { getDatabase } from "@/backend/database/db";
import { readAuthorizedJob } from "@/backend/authorization/policy";
import { OperationError } from "@/backend/operations/service";
import { normalizePhoto } from "@/backend/operations/photos";
import { MAX_PHOTO_BYTES } from "@/shared/validation/photos";
export async function POST(request: Request) {
  try {
    const userId = await apiIdentity(request, true);
    const jobId = new URL(request.url).searchParams.get("jobId") ?? "";
    const db = getDatabase();
    if (!await readAuthorizedJob(db, userId, jobId)) throw new OperationError("Request not found.", 404);
    const bytes = await normalizePhoto(await boundedBody(request, MAX_PHOTO_BYTES));
    await db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Job" WHERE id = ${jobId}::uuid FOR UPDATE`;
      if (!await readAuthorizedJob(tx, userId, jobId)) throw new OperationError("Request not found.", 404);
      const job = await tx.job.findUniqueOrThrow({ where: { id: jobId } });
      const openComplaint = await tx.complaint.count({ where: { jobId, status: { not: "RESOLVED" } } });
      if (["CLOSED", "CANCELLED"].includes(job.status) && !job.reworkActive && !openComplaint && !(job.reworkUntil && job.reworkUntil >= new Date())) throw new OperationError("Open a support complaint before adding further evidence.");
      if (await tx.jobPhoto.count({ where: { jobId } }) >= 10) throw new OperationError("A request can have up to 10 photos.");
      await tx.jobPhoto.create({ data: { jobId, uploaderId: userId, bytes: new Uint8Array(bytes) } });
      await tx.auditEvent.create({ data: { actorId: userId, action: "photo", targetId: jobId, detail: "Added a private job photo." } });
    });
    return json({ message: "Photo uploaded securely." });
  } catch (error) { return apiError(error); }
}
