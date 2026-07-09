import { QuizRepository } from '@/repositories/quiz'

export class ListQuizzesUseCase {
  constructor(private quizRepo: QuizRepository) {}

  async execute(userId: string) {
    const quizzes = await this.quizRepo.findAllByUserId(userId)
    return { quizzes }
  }
}
