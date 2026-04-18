-- CreateTable
CREATE TABLE "BroadcastBlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BroadcastBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BroadcastBlock_userId_leadId_key" ON "BroadcastBlock"("userId", "leadId");

-- AddForeignKey
ALTER TABLE "BroadcastBlock" ADD CONSTRAINT "BroadcastBlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroadcastBlock" ADD CONSTRAINT "BroadcastBlock_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
