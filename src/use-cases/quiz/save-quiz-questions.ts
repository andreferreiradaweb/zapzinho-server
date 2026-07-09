import { QuizRepository, QuizQuestionInput, QuizSettings } from '@/repositories/quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

export class SaveQuizQuestionsUseCase {
  constructor(private quizRepo: QuizRepository) {}

  async execute(
    quizId: string,
    userId: string,
    questions: QuizQuestionInput[],
    settings?: QuizSettings,
  ) {
    const quiz = await this.quizRepo.findById(quizId)
    if (!quiz || quiz.userId !== userId) throw new ResourceNotFound()
    if (settings) await this.quizRepo.update(quizId, settings)
    await this.quizRepo.saveQuestions(quizId, questions)
    const updated = await this.quizRepo.findById(quizId)
    return { quiz: updated }
  }
}
