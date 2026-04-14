/*
  Warnings:

  - You are about to drop the column `contactId` on the `MessageLog` table. All the data in the column will be lost.
  - You are about to drop the `BroadcastContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BroadcastContact" DROP CONSTRAINT "BroadcastContact_broadcastId_fkey";

-- DropForeignKey
ALTER TABLE "BroadcastContact" DROP CONSTRAINT "BroadcastContact_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_userId_fkey";

-- DropForeignKey
ALTER TABLE "MessageLog" DROP CONSTRAINT "MessageLog_contactId_fkey";

-- AlterTable
ALTER TABLE "MessageLog" DROP COLUMN "contactId",
ADD COLUMN     "leadId" TEXT;

-- DropTable
DROP TABLE "BroadcastContact";

-- DropTable
DROP TABLE "Contact";

-- CreateTable
CREATE TABLE "BroadcastLead" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "errorMsg" TEXT,

    CONSTRAINT "BroadcastLead_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BroadcastLead" ADD CONSTRAINT "BroadcastLead_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroadcastLead" ADD CONSTRAINT "BroadcastLead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
