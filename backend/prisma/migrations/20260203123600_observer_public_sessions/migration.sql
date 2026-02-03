/*
  Warnings:

  - You are about to drop the column `category` on the `ImageAsset` table. All the data in the column will be lost.
  - You are about to drop the column `doseLevel` on the `ImageAsset` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `ImageAsset` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `ImageAsset` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `ImageAsset` table. All the data in the column will be lost.
  - You are about to drop the column `modality` on the `ImageAsset` table. All the data in the column will be lost.
  - You are about to drop the column `storageUri` on the `ImageAsset` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `ImageAsset` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `ImageAsset` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `VisionTestResult` table. All the data in the column will be lost.
  - Added the required column `format` to the `ImageAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uri` to the `ImageAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `VisionTestResult` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpertiseType" AS ENUM ('RADIOLOGY', 'IMAGE_QUALITY', 'OTHER');

-- CreateEnum
CREATE TYPE "RadiologySpecialty" AS ENUM ('CHEST', 'ABDOMINAL', 'MSK', 'EMERGENCY', 'ONCOLOGY', 'PEDIATRIC', 'NEURORADIOLOGY', 'OTHER');

-- CreateEnum
CREATE TYPE "ImageFormat" AS ENUM ('DICOM', 'IMA', 'NIFTI_GZ', 'PNG', 'JPEG', 'OTHER');

-- DropForeignKey
ALTER TABLE "PairwiseEvaluation" DROP CONSTRAINT "PairwiseEvaluation_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "PairwiseEvaluation" DROP CONSTRAINT "PairwiseEvaluation_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "VisionTestResult" DROP CONSTRAINT "VisionTestResult_userId_fkey";

-- DropIndex
DROP INDEX "PairwiseEvaluation_sessionId_taskId_key";

-- DropIndex
DROP INDEX "VisionTestResult_userId_testedAt_idx";

-- AlterTable
ALTER TABLE "ImageAsset" DROP COLUMN "category",
DROP COLUMN "doseLevel",
DROP COLUMN "filename",
DROP COLUMN "height",
DROP COLUMN "meta",
DROP COLUMN "modality",
DROP COLUMN "storageUri",
DROP COLUMN "uploadedAt",
DROP COLUMN "width",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "format" "ImageFormat" NOT NULL,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "metadataJson" JSONB,
ADD COLUMN     "uri" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "invitationId" TEXT,
ADD COLUMN     "observerId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VisionTestResult" DROP COLUMN "userId",
ADD COLUMN     "sessionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ObserverProfile" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER,
    "expertiseType" "ExpertiseType" NOT NULL,
    "specialty" "RadiologySpecialty",
    "experienceYears" INTEGER,
    "consentAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObserverProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyInvitation" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyImage" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyInvitation_token_key" ON "StudyInvitation"("token");

-- CreateIndex
CREATE INDEX "StudyImage_studyId_idx" ON "StudyImage"("studyId");

-- CreateIndex
CREATE INDEX "StudyImage_imageId_idx" ON "StudyImage"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyImage_studyId_imageId_key" ON "StudyImage"("studyId", "imageId");

-- CreateIndex
CREATE INDEX "PairwiseEvaluation_sessionId_createdAt_idx" ON "PairwiseEvaluation"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "PairwiseEvaluation_taskId_createdAt_idx" ON "PairwiseEvaluation"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "VisionTestResult_sessionId_testedAt_idx" ON "VisionTestResult"("sessionId", "testedAt");

-- AddForeignKey
ALTER TABLE "StudyInvitation" ADD CONSTRAINT "StudyInvitation_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_observerId_fkey" FOREIGN KEY ("observerId") REFERENCES "ObserverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "StudyInvitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisionTestResult" ADD CONSTRAINT "VisionTestResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyImage" ADD CONSTRAINT "StudyImage_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyImage" ADD CONSTRAINT "StudyImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "ImageAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairwiseTask" ADD CONSTRAINT "PairwiseTask_leftImageId_fkey" FOREIGN KEY ("leftImageId") REFERENCES "ImageAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairwiseTask" ADD CONSTRAINT "PairwiseTask_rightImageId_fkey" FOREIGN KEY ("rightImageId") REFERENCES "ImageAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairwiseEvaluation" ADD CONSTRAINT "PairwiseEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairwiseEvaluation" ADD CONSTRAINT "PairwiseEvaluation_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "PairwiseTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
