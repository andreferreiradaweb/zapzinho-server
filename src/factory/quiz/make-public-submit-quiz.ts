import { PrismaQuizRepository, PrismaQuizLeadRepository } from '@/repositories/prisma/quiz'
import { PublicSubmitQuizUseCase } from '@/use-cases/quiz/public-submit-quiz'

export function makePublicSubmitQuiz() {
  return new PublicSubmitQuizUseCase(
    new PrismaQuizRepository(),
    new PrismaQuizLeadRepository(),
  )
}
