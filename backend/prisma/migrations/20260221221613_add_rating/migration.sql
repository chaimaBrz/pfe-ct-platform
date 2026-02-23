-- CreateTable
CREATE TABLE "RatingTask" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "randomSeed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingEvaluation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "responseTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatingEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RatingTask_studyId_createdAt_idx" ON "RatingTask"("studyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RatingTask_studyId_imageId_key" ON "RatingTask"("studyId", "imageId");

-- CreateIndex
CREATE INDEX "RatingEvaluation_sessionId_createdAt_idx" ON "RatingEvaluation"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "RatingEvaluation_taskId_createdAt_idx" ON "RatingEvaluation"("taskId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RatingEvaluation_sessionId_taskId_key" ON "RatingEvaluation"("sessionId", "taskId");

-- AddForeignKey
ALTER TABLE "RatingTask" ADD CONSTRAINT "RatingTask_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingTask" ADD CONSTRAINT "RatingTask_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "ImageAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingEvaluation" ADD CONSTRAINT "RatingEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingEvaluation" ADD CONSTRAINT "RatingEvaluation_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "RatingTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
