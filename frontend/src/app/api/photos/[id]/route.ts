import { apiIdentity, apiError } from "@/backend/operations/http";
import { getDatabase } from "@/backend/database/db";
import { readAuthorizedJob } from "@/backend/authorization/policy";
import { OperationError } from "@/backend/operations/service";
import { z } from "zod";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await apiIdentity(request), { id } = await params;
    if (!z.uuid().safeParse(id).success) throw new OperationError("Photo not found.", 404);
    const db = getDatabase(), photo = await db.jobPhoto.findUnique({ where: { id }, select: { jobId: true } });
    if (!photo || !await readAuthorizedJob(db, userId, photo.jobId)) throw new OperationError("Photo not found.", 404);
    const data = await db.jobPhoto.findUniqueOrThrow({ where: { id }, select: { bytes: true } });
    return new Response(new Uint8Array(data.bytes), { headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline; filename=job-photo.webp" } });
  } catch (error) { return apiError(error); }
}
