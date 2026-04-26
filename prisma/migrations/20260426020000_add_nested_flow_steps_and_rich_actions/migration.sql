-- AlterEnum
ALTER TYPE "FlowActionType" ADD VALUE 'SEND_IMAGE';
ALTER TYPE "FlowActionType" ADD VALUE 'SEND_TEMPLATE';
ALTER TYPE "FlowActionType" ADD VALUE 'SEND_PRODUCT';

-- AlterTable
ALTER TABLE "FlowOption" ADD COLUMN "nextStepId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FlowOption_nextStepId_key" ON "FlowOption"("nextStepId");

-- AddForeignKey
ALTER TABLE "FlowOption" ADD CONSTRAINT "FlowOption_nextStepId_fkey" FOREIGN KEY ("nextStepId") REFERENCES "FlowStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
