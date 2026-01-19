-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_productId_fkey";

-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
