/*
  Warnings:

  - Added the required column `gameId` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "GameStatus" ADD VALUE 'pending';

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "gameId" TEXT NOT NULL;
