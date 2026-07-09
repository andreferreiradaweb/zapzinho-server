import { PrismaQuizRepository, PrismaQuizLeadRepository } from '@/repositories/prisma/quiz'
import { PartialSaveQuizUseCase } from '@/use-cases/quiz/partial-save-quiz'

export function makePartialSaveQuiz() {
  return new PartialSaveQuizUseCase(
    new PrismaQuizRepository(),
    new PrismaQuizLeadRepository(),
  )
}
