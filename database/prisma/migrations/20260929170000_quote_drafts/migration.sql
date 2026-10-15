ALTER TABLE "JobDocument" DROP CONSTRAINT "JobDocument_status";
ALTER TABLE "JobDocument" ADD CONSTRAINT "JobDocument_status" CHECK (("kind" = 'INVOICE' AND "status" = 'ISSUED') OR ("kind" = 'QUOTE' AND "status" IN ('DRAFT','SENT','APPROVED','REJECTED','EXPIRED','SUPERSEDED')));
CREATE UNIQUE INDEX "one_draft_quote" ON "JobDocument" ("jobId") WHERE "kind" = 'QUOTE' AND "status" = 'DRAFT';
