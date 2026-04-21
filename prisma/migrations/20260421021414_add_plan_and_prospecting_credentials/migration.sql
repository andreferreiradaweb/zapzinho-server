-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('PADRAO', 'EXPERT', 'VIP');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Plan" "UserPlan" NOT NULL DEFAULT 'PADRAO',
ADD COLUMN     "prospectingInstanceId" TEXT,
ADD COLUMN     "prospectingToken" TEXT;
