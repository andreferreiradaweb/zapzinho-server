import { PrismaQuizRepository, PrismaQuizLeadRepository } from '@/repositories/prisma/quiz'
import { DeleteQuizLeadUseCase } from '@/use-cases/quiz/delete-quiz-lead'

export function makeDeleteQuizLead() {
  return new DeleteQuizLeadUseCase(new PrismaQuizRepository(), new PrismaQuizLeadRepository())
}
