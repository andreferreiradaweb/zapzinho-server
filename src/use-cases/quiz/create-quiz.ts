import { QuizRepository } from '@/repositories/quiz'

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'quiz'
  )
}

function randomCode(length: number): string {
  return Math.random().toString(36).slice(2, 2 + length)
}

export class CreateQuizUseCase {
  constructor(private quizRepo: QuizRepository) {}

  async execute(data: { userId: string; name: string; description?: string }) {
    const slug = slugify(data.name) + '-' + randomCode(5)
    const quiz = await this.quizRepo.create({ ...data, slug })
    return { quiz }
  }
}
