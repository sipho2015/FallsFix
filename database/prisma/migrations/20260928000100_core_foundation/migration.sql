BEGIN;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'TECHNICIAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'TECHNICIAN_ASSIGNED', 'ACCEPTED', 'ASSESSING', 'AWAITING_QUOTE_APPROVAL', 'READY_TO_SCHEDULE', 'SCHEDULED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'AWAITING_CUSTOMER_CONFIRMATION', 'COMPLETED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'REPLACED', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AppointmentPurpose" AS ENUM ('ASSESSMENT', 'WORK');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PROPOSED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NoteVisibility" AS ENUM ('INTERNAL', 'CUSTOMER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(32),
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" UUID NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","role")
);

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "userId" UUID NOT NULL,
    "businessName" VARCHAR(160),

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "TechnicianProfile" (
    "userId" UUID NOT NULL,
    "bio" VARCHAR(2000),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMPTZ(3),
    "verifiedById" UUID,

    CONSTRAINT "TechnicianProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "ServiceArea" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "countryCode" CHAR(2) NOT NULL,
    "timezone" VARCHAR(64) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicianSkill" (
    "technicianId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "TechnicianSkill_pkey" PRIMARY KEY ("technicianId","categoryId")
);

-- CreateTable
CREATE TABLE "TechnicianServiceArea" (
    "technicianId" UUID NOT NULL,
    "serviceAreaId" UUID NOT NULL,

    CONSTRAINT "TechnicianServiceArea_pkey" PRIMARY KEY ("technicianId","serviceAreaId")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "reference" SERIAL NOT NULL,
    "customerId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "serviceAreaId" UUID NOT NULL,
    "description" VARCHAR(5000) NOT NULL,
    "preferredAt" TIMESTAMPTZ(3),
    "status" "JobStatus" NOT NULL DEFAULT 'REQUESTED',
    "version" INTEGER NOT NULL DEFAULT 0,
    "requestKey" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobLocation" (
    "jobId" UUID NOT NULL,
    "addressLine" VARCHAR(300) NOT NULL,
    "locality" VARCHAR(120) NOT NULL,
    "directions" VARCHAR(1000),
    "contactName" VARCHAR(120) NOT NULL,
    "contactPhone" VARCHAR(32) NOT NULL,

    CONSTRAINT "JobLocation_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "JobAssignment" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "technicianId" UUID NOT NULL,
    "assignedById" UUID NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "assignedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMPTZ(3),
    "endedAt" TIMESTAMPTZ(3),
    "reason" VARCHAR(1000),

    CONSTRAINT "JobAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobStatusHistory" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "fromStatus" "JobStatus",
    "toStatus" "JobStatus" NOT NULL,
    "reason" VARCHAR(1000),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobNote" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "body" VARCHAR(5000) NOT NULL,
    "visibility" "NoteVisibility" NOT NULL DEFAULT 'INTERNAL',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAppointment" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "purpose" "AppointmentPurpose" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PROPOSED',
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "JobAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserRole_role_idx" ON "UserRole"("role");

-- CreateIndex
CREATE INDEX "TechnicianProfile_verifiedById_idx" ON "TechnicianProfile"("verifiedById");

-- CreateIndex
CREATE INDEX "TechnicianProfile_verificationStatus_isActive_idx" ON "TechnicianProfile"("verificationStatus", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceArea_slug_key" ON "ServiceArea"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- CreateIndex
CREATE INDEX "TechnicianSkill_categoryId_idx" ON "TechnicianSkill"("categoryId");

-- CreateIndex
CREATE INDEX "TechnicianServiceArea_serviceAreaId_idx" ON "TechnicianServiceArea"("serviceAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_reference_key" ON "Job"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Job_requestKey_key" ON "Job"("requestKey");

-- CreateIndex
CREATE INDEX "Job_customerId_createdAt_idx" ON "Job"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_categoryId_idx" ON "Job"("categoryId");

-- CreateIndex
CREATE INDEX "Job_serviceAreaId_idx" ON "Job"("serviceAreaId");

-- CreateIndex
CREATE INDEX "JobAssignment_jobId_assignedAt_idx" ON "JobAssignment"("jobId", "assignedAt");

-- CreateIndex
CREATE INDEX "JobAssignment_technicianId_status_idx" ON "JobAssignment"("technicianId", "status");

-- CreateIndex
CREATE INDEX "JobAssignment_assignedById_idx" ON "JobAssignment"("assignedById");

-- CreateIndex
CREATE INDEX "JobStatusHistory_jobId_createdAt_idx" ON "JobStatusHistory"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "JobStatusHistory_actorId_idx" ON "JobStatusHistory"("actorId");

-- CreateIndex
CREATE INDEX "JobNote_jobId_createdAt_idx" ON "JobNote"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "JobNote_authorId_idx" ON "JobNote"("authorId");

-- CreateIndex
CREATE INDEX "JobAppointment_jobId_startsAt_idx" ON "JobAppointment"("jobId", "startsAt");

-- CreateIndex
CREATE INDEX "JobAppointment_status_startsAt_idx" ON "JobAppointment"("status", "startsAt");

-- CreateIndex
CREATE INDEX "JobAppointment_createdById_idx" ON "JobAppointment"("createdById");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianProfile" ADD CONSTRAINT "TechnicianProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianProfile" ADD CONSTRAINT "TechnicianProfile_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianSkill" ADD CONSTRAINT "TechnicianSkill_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianSkill" ADD CONSTRAINT "TechnicianSkill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianServiceArea" ADD CONSTRAINT "TechnicianServiceArea_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianServiceArea" ADD CONSTRAINT "TechnicianServiceArea_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLocation" ADD CONSTRAINT "JobLocation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAssignment" ADD CONSTRAINT "JobAssignment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAssignment" ADD CONSTRAINT "JobAssignment_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAssignment" ADD CONSTRAINT "JobAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobStatusHistory" ADD CONSTRAINT "JobStatusHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobStatusHistory" ADD CONSTRAINT "JobStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobNote" ADD CONSTRAINT "JobNote_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobNote" ADD CONSTRAINT "JobNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAppointment" ADD CONSTRAINT "JobAppointment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAppointment" ADD CONSTRAINT "JobAppointment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PostgreSQL invariants not expressible in the Prisma model definitions.
CREATE UNIQUE INDEX "JobAssignment_one_current_per_job"
ON "JobAssignment" ("jobId") WHERE "endedAt" IS NULL;

ALTER TABLE "User" ADD CONSTRAINT "User_email_canonical"
CHECK ("email" = lower(btrim("email")) AND length("email") > 3);

ALTER TABLE "TechnicianProfile" ADD CONSTRAINT "TechnicianProfile_verification_evidence"
CHECK ("verificationStatus" <> 'VERIFIED' OR ("verifiedAt" IS NOT NULL AND "verifiedById" IS NOT NULL));
ALTER TABLE "TechnicianProfile" ADD CONSTRAINT "TechnicianProfile_active_verified"
CHECK (NOT "isActive" OR "verificationStatus" = 'VERIFIED');

ALTER TABLE "Job" ADD CONSTRAINT "Job_version_nonnegative" CHECK ("version" >= 0);
ALTER TABLE "Job" ADD CONSTRAINT "Job_description_nonempty" CHECK (length(btrim("description")) > 0);
ALTER TABLE "JobLocation" ADD CONSTRAINT "JobLocation_address_nonempty" CHECK (length(btrim("addressLine")) > 0);
ALTER TABLE "JobNote" ADD CONSTRAINT "JobNote_body_nonempty" CHECK (length(btrim("body")) > 0);

ALTER TABLE "JobAssignment" ADD CONSTRAINT "JobAssignment_end_matches_status"
CHECK (("status" IN ('PENDING', 'ACCEPTED') AND "endedAt" IS NULL)
    OR ("status" IN ('DECLINED', 'REPLACED', 'FINISHED', 'CANCELLED') AND "endedAt" IS NOT NULL));
ALTER TABLE "JobAssignment" ADD CONSTRAINT "JobAssignment_time_order"
CHECK (("endedAt" IS NULL OR "endedAt" >= "assignedAt")
   AND ("respondedAt" IS NULL OR "respondedAt" >= "assignedAt"));

ALTER TABLE "JobAppointment" ADD CONSTRAINT "JobAppointment_positive_duration" CHECK ("endsAt" > "startsAt");
ALTER TABLE "JobStatusHistory" ADD CONSTRAINT "JobStatusHistory_distinct_status"
CHECK ("fromStatus" IS NULL OR "fromStatus" <> "toStatus");

COMMIT;
