import { PrismaQuizRepository, PrismaQuizLeadRepository } from '@/repositories/prisma/quiz'
import { ListQuizLeadsUseCase } from '@/use-cases/quiz/list-quiz-leads'

export function makeListQuizLeads() {
  return new ListQuizLeadsUseCase(new PrismaQuizRepository(), new PrismaQuizLeadRepository())
}
