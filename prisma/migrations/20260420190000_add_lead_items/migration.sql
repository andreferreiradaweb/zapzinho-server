-- CreateTable
CREATE TABLE "LeadItem" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "LeadItem_pkey" PRIMARY KEY ("id")
);

-- Migrate existing data: one LeadItem per Lead that has a productId
INSERT INTO "LeadItem" ("id", "leadId", "productId", "quantity")
SELECT gen_random_uuid(), "id", "productId", 1
FROM "Lead"
WHERE "productId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "LeadItem" ADD CONSTRAINT "LeadItem_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadItem" ADD CONSTRAINT "LeadItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropColumn
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "quantity";
