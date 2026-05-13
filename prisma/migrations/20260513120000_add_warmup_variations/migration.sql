-- AlterTable
ALTER TABLE "ProspectingBroadcast" ADD COLUMN "warmupVariations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
