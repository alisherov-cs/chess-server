/*
  Warnings:

  - The values [pending] on the enum `GameStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Board` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EnPassant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Move` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Piece` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameStatus_new" AS ENUM ('ongoing', 'completed', 'aborted');
ALTER TABLE "public"."Game" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Game" ALTER COLUMN "status" TYPE "GameStatus_new" USING ("status"::text::"GameStatus_new");
ALTER TYPE "GameStatus" RENAME TO "GameStatus_old";
ALTER TYPE "GameStatus_new" RENAME TO "GameStatus";
DROP TYPE "public"."GameStatus_old";
ALTER TABLE "Game" ALTER COLUMN "status" SET DEFAULT 'ongoing';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Board" DROP CONSTRAINT "Board_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EnPassant" DROP CONSTRAINT "EnPassant_boardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Move" DROP CONSTRAINT "Move_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Move" DROP CONSTRAINT "Move_playerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Piece" DROP CONSTRAINT "Piece_boardId_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "currentPosition" TEXT[],
ADD COLUMN     "drawOffer" TEXT,
ADD COLUMN     "history" TEXT[],
ADD COLUMN     "winnerId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'ongoing';

-- DropTable
DROP TABLE "public"."Board";

-- DropTable
DROP TABLE "public"."EnPassant";

-- DropTable
DROP TABLE "public"."Move";

-- DropTable
DROP TABLE "public"."Piece";

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
