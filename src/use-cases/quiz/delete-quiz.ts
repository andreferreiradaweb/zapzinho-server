import { QuizRepository } from '@/repositories/quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

export class DeleteQuizUseCase {
  constructor(private quizRepo: QuizRepository) {}

  async execute(id: string, userId: string) {
    const quiz = await this.quizRepo.findById(id)
    if (!quiz || quiz.userId !== userId) throw new ResourceNotFound()
    await this.quizRepo.delete(id)
  }
}
