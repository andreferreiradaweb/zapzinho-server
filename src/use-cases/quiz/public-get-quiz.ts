import { QuizRepository } from '@/repositories/quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

export class PublicGetQuizUseCase {
  constructor(private quizRepo: QuizRepository) {}

  async execute(token: string) {
    const quiz = await this.quizRepo.findByToken(token)
    if (!quiz) throw new ResourceNotFound()
    // Strip isQualifying so the public API doesn't leak qualification logic
    const safe = {
      ...quiz,
      Questions: quiz.Questions.map((q) => ({
        ...q,
        Options: q.Options.map(({ isQualifying: _iq, ...o }) => o),
      })),
    }
    return { quiz: safe }
  }
}
