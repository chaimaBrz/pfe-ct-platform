-- AlterTable
ALTER TABLE "ObserverProfile" ADD COLUMN     "expertiseYears" INTEGER,
ADD COLUMN     "isExpert" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nonExpertRole" TEXT;
