-- CreateEnum
CREATE TYPE "PassFail" AS ENUM ('PASS', 'FAIL');

-- CreateTable
CREATE TABLE "VisionTestResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ishiharaScore" INTEGER NOT NULL,
    "ishiharaTotal" INTEGER NOT NULL,
    "contrastScore" DOUBLE PRECISION NOT NULL,
    "status" "PassFail" NOT NULL,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "VisionTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisionTestResult_userId_testedAt_idx" ON "VisionTestResult"("userId", "testedAt");

-- AddForeignKey
ALTER TABLE "VisionTestResult" ADD CONSTRAINT "VisionTestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
