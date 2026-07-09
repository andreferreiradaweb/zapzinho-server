import { QuizRepository } from '@/repositories/quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

export class GetQuizUseCase {
  constructor(private quizRepo: QuizRepository) {}

  async execute(id: string, userId: string) {
    const quiz = await this.quizRepo.findById(id)
    if (!quiz || quiz.userId !== userId) throw new ResourceNotFound()
    return { quiz }
  }
}
