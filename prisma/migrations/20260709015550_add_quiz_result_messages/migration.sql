-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "resultNotQualMsg" TEXT NOT NULL DEFAULT 'Agradecemos sua participação. Fique de olho em nossas novidades.',
ADD COLUMN     "resultNotQualTitle" TEXT NOT NULL DEFAULT 'Obrigado!',
ADD COLUMN     "resultQualifiedMsg" TEXT NOT NULL DEFAULT 'Você foi qualificado! Nossa equipe entrará em contato em breve.',
ADD COLUMN     "resultQualifiedTitle" TEXT NOT NULL DEFAULT 'Parabéns!';
