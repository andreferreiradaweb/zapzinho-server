import { QuizRepository } from '@/repositories/quiz'

export class CreateQuizUseCase {
  constructor(private quizRepo: QuizRepository) {}

  async execute(data: { userId: string; name: string; description?: string }) {
    const quiz = await this.quizRepo.create(data)
    return { quiz }
  }
}
