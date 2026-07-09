import { PrismaQuizRepository } from '@/repositories/prisma/quiz'
import { SaveQuizQuestionsUseCase } from '@/use-cases/quiz/save-quiz-questions'

export function makeSaveQuizQuestions() {
  return new SaveQuizQuestionsUseCase(new PrismaQuizRepository())
}
