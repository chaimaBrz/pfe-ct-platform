/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,taskId]` on the table `PairwiseEvaluation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PairwiseEvaluation_sessionId_taskId_key" ON "PairwiseEvaluation"("sessionId", "taskId");
