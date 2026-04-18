/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Broadcast` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Broadcast" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[];
