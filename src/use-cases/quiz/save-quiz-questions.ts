import { QuizRepository, QuizQuestionInput } from '@/repositories/quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

export class SaveQuizQuestionsUseCase {
  constructor(private quizRepo: QuizRepository) {}

  async execute(quizId: string, userId: string, questions: QuizQuestionInput[]) {
    const quiz = await this.quizRepo.findById(quizId)
    if (!quiz || quiz.userId !== userId) throw new ResourceNotFound()
    await this.quizRepo.saveQuestions(quizId, questions)
    const updated = await this.quizRepo.findById(quizId)
    return { quiz: updated }
  }
}
