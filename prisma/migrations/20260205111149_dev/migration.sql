/*
  Warnings:

  - Added the required column `timeId` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeId` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "timeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "timeId" TEXT NOT NULL;
