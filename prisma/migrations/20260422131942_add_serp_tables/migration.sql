/*
  Warnings:

  - A unique constraint covering the columns `[userId,telefone]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "SerpSearchLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SerpSearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SerpSearchOffset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "queryKey" TEXT NOT NULL,
    "nextStart" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SerpSearchOffset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SerpSearchOffset_userId_queryKey_key" ON "SerpSearchOffset"("userId", "queryKey");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_userId_telefone_key" ON "Lead"("userId", "telefone");

-- AddForeignKey
ALTER TABLE "SerpSearchLog" ADD CONSTRAINT "SerpSearchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerpSearchOffset" ADD CONSTRAINT "SerpSearchOffset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
