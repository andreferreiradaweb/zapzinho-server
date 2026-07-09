import { PrismaQuizRepository } from '@/repositories/prisma/quiz'
import { PublicGetQuizUseCase } from '@/use-cases/quiz/public-get-quiz'

export function makePublicGetQuiz() {
  return new PublicGetQuizUseCase(new PrismaQuizRepository())
}
