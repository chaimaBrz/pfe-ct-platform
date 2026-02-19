/*
  Warnings:

  - You are about to drop the column `expertiseYears` on the `ObserverProfile` table. All the data in the column will be lost.
  - You are about to drop the column `isExpert` on the `ObserverProfile` table. All the data in the column will be lost.
  - You are about to drop the column `nonExpertRole` on the `ObserverProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VisionStatus" AS ENUM ('NORMAL', 'COLOR_VISION_DEFICIENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "VisionCorrection" AS ENUM ('NONE', 'GLASSES', 'CONTACT_LENSES', 'OTHER');

-- CreateEnum
CREATE TYPE "FatigueLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "ObserverProfile" DROP COLUMN "expertiseYears",
DROP COLUMN "isExpert",
DROP COLUMN "nonExpertRole",
ADD COLUMN     "fatigueLevel" "FatigueLevel" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "otherExpertiseText" TEXT,
ADD COLUMN     "visionCorrection" "VisionCorrection" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "visionOtherText" TEXT,
ADD COLUMN     "visionStatus" "VisionStatus" NOT NULL DEFAULT 'NORMAL',
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;
