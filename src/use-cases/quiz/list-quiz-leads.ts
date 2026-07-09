import { QuizRepository, QuizLeadRepository } from '@/repositories/quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

export class ListQuizLeadsUseCase {
  constructor(
    private quizRepo: QuizRepository,
    private leadRepo: QuizLeadRepository,
  ) {}

  async execute(quizId: string, userId: string, status?: string) {
    const quiz = await this.quizRepo.findById(quizId)
    if (!quiz || quiz.userId !== userId) throw new ResourceNotFound()
    const leads = await this.leadRepo.findAllByQuizId(quizId, status)
    return { leads }
  }
}
