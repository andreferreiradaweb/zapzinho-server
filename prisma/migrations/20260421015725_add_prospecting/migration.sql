-- CreateEnum
CREATE TYPE "ImportedContactStatus" AS ENUM ('PENDING', 'WARMUP_SENT', 'REPLIED', 'TEMPLATE_SENT', 'CONVERTED', 'FAILED');

-- CreateTable
CREATE TABLE "ContactList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportedContact" (
    "id" TEXT NOT NULL,
    "contactListId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "status" "ImportedContactStatus" NOT NULL DEFAULT 'PENDING',
    "warmupSentAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "templateSentAt" TIMESTAMP(3),
    "convertedLeadId" TEXT,
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportedContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProspectingBroadcast" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactListId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "warmupMessage" TEXT NOT NULL,
    "templateMessage" TEXT NOT NULL,
    "status" "BroadcastStatus" NOT NULL DEFAULT 'DRAFT',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProspectingBroadcast_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContactList" ADD CONSTRAINT "ContactList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedContact" ADD CONSTRAINT "ImportedContact_contactListId_fkey" FOREIGN KEY ("contactListId") REFERENCES "ContactList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectingBroadcast" ADD CONSTRAINT "ProspectingBroadcast_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectingBroadcast" ADD CONSTRAINT "ProspectingBroadcast_contactListId_fkey" FOREIGN KEY ("contactListId") REFERENCES "ContactList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
