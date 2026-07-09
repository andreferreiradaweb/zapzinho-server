import { PrismaQuizRepository } from '@/repositories/prisma/quiz'
import { ListQuizzesUseCase } from '@/use-cases/quiz/list-quizzes'

export function makeListQuizzes() {
  return new ListQuizzesUseCase(new PrismaQuizRepository())
}
