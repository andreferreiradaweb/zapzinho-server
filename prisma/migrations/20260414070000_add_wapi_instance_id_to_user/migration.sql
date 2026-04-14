ALTER TABLE "User" ADD COLUMN "wapiInstanceId" TEXT;
CREATE UNIQUE INDEX "User_wapiInstanceId_key" ON "User"("wapiInstanceId");
