/*
  Warnings:

  - Added the required column `Option` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CustomerType` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('B2C', 'B2B');

-- CreateEnum
CREATE TYPE "LeadOption" AS ENUM ('ATEMDIMENTO_IA', 'ATENDIMENTO_HUMANO');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "Option" "LeadOption" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "CustomerType" "CustomerType" NOT NULL;
