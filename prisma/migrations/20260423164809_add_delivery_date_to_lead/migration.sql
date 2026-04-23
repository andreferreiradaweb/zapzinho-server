-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "delivered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deliveryDate" TIMESTAMP(3);
