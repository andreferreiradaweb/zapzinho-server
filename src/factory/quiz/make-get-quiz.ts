import { PrismaQuizRepository } from '@/repositories/prisma/quiz'
import { GetQuizUseCase } from '@/use-cases/quiz/get-quiz'

export function makeGetQuiz() {
  return new GetQuizUseCase(new PrismaQuizRepository())
}
