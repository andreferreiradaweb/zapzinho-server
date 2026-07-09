import { PrismaQuizRepository } from '@/repositories/prisma/quiz'
import { CreateQuizUseCase } from '@/use-cases/quiz/create-quiz'

export function makeCreateQuiz() {
  return new CreateQuizUseCase(new PrismaQuizRepository())
}
