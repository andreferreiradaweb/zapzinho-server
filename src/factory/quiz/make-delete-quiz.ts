import { PrismaQuizRepository } from '@/repositories/prisma/quiz'
import { DeleteQuizUseCase } from '@/use-cases/quiz/delete-quiz'

export function makeDeleteQuiz() {
  return new DeleteQuizUseCase(new PrismaQuizRepository())
}
