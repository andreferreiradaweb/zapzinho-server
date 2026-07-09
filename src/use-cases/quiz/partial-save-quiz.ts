import { QuizRepository, QuizLeadRepository } from '@/repositories/quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

interface PartialSaveParams {
  slug: string
  name: string
  phone?: string
  email?: string
}

export class PartialSaveQuizUseCase {
  constructor(
    private quizRepo: QuizRepository,
    private leadRepo: QuizLeadRepository,
  ) {}

  async execute(params: PartialSaveParams) {
    const quiz = await this.quizRepo.findBySlug(params.slug)
    if (!quiz) throw new ResourceNotFound()

    const lead = await this.leadRepo.create({
      quizId: quiz.id,
      name: params.name,
      phone: params.phone ?? '',
      email: params.email ?? '',
      status: 'PARTIAL',
      score: 0,
    })

    return { leadId: lead.id }
  }
}
