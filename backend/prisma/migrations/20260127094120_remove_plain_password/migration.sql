/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `password_hash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "password_hash" TEXT;
UPDATE "User" SET "password_hash" = 'TEMP_HASH';
ALTER TABLE "User" ALTER COLUMN "password_hash" SET NOT NULL;
ALTER TABLE "User" DROP COLUMN "password";
