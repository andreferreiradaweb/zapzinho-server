import { QuizRepository } from '@/repositories/quiz'

export class ListQuizzesUseCase {
  constructor(private quizRepo: QuizRepository) {}

  async execute(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit
    const [quizzes, total] = await Promise.all([
      this.quizRepo.findAllByUserId(userId, offset, limit),
      this.quizRepo.countByUserId(userId),
    ])
    return { quizzes, total, page, pages: Math.ceil(total / limit) }
  }
}
