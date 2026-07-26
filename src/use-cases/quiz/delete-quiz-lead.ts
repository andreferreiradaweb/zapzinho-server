import { QuizRepository, QuizLeadRepository } from '@/repositories/quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

export class DeleteQuizLeadUseCase {
  constructor(
    private quizRepo: QuizRepository,
    private leadRepo: QuizLeadRepository,
  ) {}

  async execute(quizId: string, leadId: string, userId: string) {
    const quiz = await this.quizRepo.findById(quizId)
    if (!quiz || quiz.userId !== userId) throw new ResourceNotFound()
    await this.leadRepo.delete(leadId)
  }
}
