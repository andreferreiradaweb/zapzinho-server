-- CreateEnum
CREATE TYPE "FlowActionType" AS ENUM ('SEND_MESSAGE', 'UPDATE_LEAD_STATUS', 'ASSIGN_CATEGORY');

-- CreateEnum
CREATE TYPE "FlowSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "MessageType" ADD VALUE 'FLOW';

-- AlterTable
ALTER TABLE "LeadSaleItem" ADD COLUMN     "costPrice" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Flow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowStep" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "FlowStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowOption" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,

    CONSTRAINT "FlowOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowAction" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "type" "FlowActionType" NOT NULL,
    "payload" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FlowAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowSession" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "FlowSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlowSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlowSession_userId_phone_status_idx" ON "FlowSession"("userId", "phone", "status");

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowStep" ADD CONSTRAINT "FlowStep_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowOption" ADD CONSTRAINT "FlowOption_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "FlowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowAction" ADD CONSTRAINT "FlowAction_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "FlowOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowSession" ADD CONSTRAINT "FlowSession_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowSession" ADD CONSTRAINT "FlowSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
