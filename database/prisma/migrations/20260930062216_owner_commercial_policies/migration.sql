-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "completedNotifiedAt" TIMESTAMPTZ(3),
ADD COLUMN     "retentionReason" VARCHAR(1000),
ADD COLUMN     "reworkActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reworkUntil" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "JobDocument" ADD COLUMN     "issuerSnapshot" JSONB,
ADD COLUMN     "technicianSnapshot" VARCHAR(160);

-- AlterTable
ALTER TABLE "TechnicianProfile" ADD COLUMN     "verificationEvidence" JSONB;

-- CreateTable
CREATE TABLE "JobRefund" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "operationId" UUID NOT NULL,
    "paidSnapshot" INTEGER NOT NULL,
    "excludedPaid" INTEGER NOT NULL,
    "eligiblePaid" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "creditAmount" INTEGER NOT NULL,
    "reason" VARCHAR(2000) NOT NULL,
    "excludedCosts" VARCHAR(2000) NOT NULL,
    "approvedById" UUID NOT NULL,
    "approvedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMPTZ(3),
    "method" VARCHAR(32),
    "reference" VARCHAR(160),

    CONSTRAINT "JobRefund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobRefund_documentId_key" ON "JobRefund"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "JobRefund_operationId_key" ON "JobRefund"("operationId");

-- AddForeignKey
ALTER TABLE "JobRefund" ADD CONSTRAINT "JobRefund_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "JobDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "JobRefund" ADD CONSTRAINT "JobRefund_amounts" CHECK ("paidSnapshot" > 0 AND "excludedPaid" >= 0 AND "eligiblePaid" = "paidSnapshot" - "excludedPaid" AND "eligiblePaid" > 0 AND "amount" > 0 AND "amount" <= "eligiblePaid" AND "creditAmount" >= "amount");
ALTER TABLE "JobRefund" ADD CONSTRAINT "JobRefund_disbursement" CHECK (("paidAt" IS NULL AND "method" IS NULL AND "reference" IS NULL) OR ("paidAt" IS NOT NULL AND "method" IN ('CASH','BANK_TRANSFER') AND "reference" IS NOT NULL));
