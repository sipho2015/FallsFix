ALTER TABLE "JobDocument" ALTER COLUMN "scope" TYPE TEXT;
ALTER TABLE "JobRefund" ADD CONSTRAINT "JobRefund_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "Job" ADD CONSTRAINT "Job_rework_window" CHECK (("completedNotifiedAt" IS NULL AND "reworkUntil" IS NULL) OR ("completedNotifiedAt" IS NOT NULL AND "reworkUntil" >= "completedNotifiedAt" + INTERVAL '3 days'));
