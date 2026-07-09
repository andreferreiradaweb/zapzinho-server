-- AlterTable
ALTER TABLE "ProspectingBroadcast" ALTER COLUMN "warmupVariations" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "captureEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "captureEmailText" TEXT NOT NULL DEFAULT 'Qual é o seu e-mail?',
ADD COLUMN     "captureNameText" TEXT NOT NULL DEFAULT 'Qual é o seu nome?',
ADD COLUMN     "capturePhone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "capturePhoneText" TEXT NOT NULL DEFAULT 'Qual é o seu WhatsApp?',
ADD COLUMN     "welcomeMessage" TEXT NOT NULL DEFAULT '';
