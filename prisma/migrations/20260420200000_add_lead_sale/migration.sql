-- CreateTable LeadSale
CREATE TABLE "LeadSale" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable LeadSaleItem
CREATE TABLE "LeadSaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "LeadSaleItem_pkey" PRIMARY KEY ("id")
);

-- Migrate existing VENDIDO leads that have LeadItems → create one LeadSale each
INSERT INTO "LeadSale" ("id", "leadId", "userId", "createdAt")
SELECT gen_random_uuid(), l."id", l."userId", l."updatedAt"
FROM "Lead" l
WHERE l."Status" = 'VENDIDO'
  AND EXISTS (SELECT 1 FROM "LeadItem" li WHERE li."leadId" = l."id");

-- Migrate their LeadItems → LeadSaleItems with price snapshot
INSERT INTO "LeadSaleItem" ("id", "saleId", "productId", "quantity", "price")
SELECT
    gen_random_uuid(),
    ls."id",
    li."productId",
    li."quantity",
    COALESCE(
        CAST(NULLIF(REPLACE(TRIM(COALESCE(p."price", '')), ',', '.'), '') AS DOUBLE PRECISION),
        0
    )
FROM "LeadSale" ls
JOIN "Lead" l ON l."id" = ls."leadId"
JOIN "LeadItem" li ON li."leadId" = l."id"
JOIN "Product" p ON p."id" = li."productId";

-- AddForeignKey
ALTER TABLE "LeadSale" ADD CONSTRAINT "LeadSale_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeadSale" ADD CONSTRAINT "LeadSale_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LeadSaleItem" ADD CONSTRAINT "LeadSaleItem_saleId_fkey"
    FOREIGN KEY ("saleId") REFERENCES "LeadSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeadSaleItem" ADD CONSTRAINT "LeadSaleItem_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
