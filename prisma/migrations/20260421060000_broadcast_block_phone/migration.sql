-- DropForeignKey
ALTER TABLE "BroadcastBlock" DROP CONSTRAINT "BroadcastBlock_leadId_fkey";

-- DropIndex
DROP INDEX "BroadcastBlock_userId_leadId_key";

-- AlterTable
ALTER TABLE "BroadcastBlock" DROP COLUMN "leadId",
ADD COLUMN "phone" TEXT NOT NULL DEFAULT '',
ADD COLUMN "name" TEXT;

-- Remove default after populating (column is now NOT NULL without default)
ALTER TABLE "BroadcastBlock" ALTER COLUMN "phone" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "BroadcastBlock_userId_phone_key" ON "BroadcastBlock"("userId", "phone");
