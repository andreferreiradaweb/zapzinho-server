-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "lastBroadcastAt" TIMESTAMP(3),
ADD COLUMN     "lastClientMessageAt" TIMESTAMP(3);
