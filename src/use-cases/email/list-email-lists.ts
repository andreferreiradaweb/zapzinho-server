import { EmailListRepository } from '@/repositories/email'

export class ListEmailListsUseCase {
  constructor(private repo: EmailListRepository) {}

  async execute(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit
    const [emailLists, total] = await Promise.all([
      this.repo.findAllByUserId(userId, offset, limit),
      this.repo.countByUserId(userId),
    ])
    return { emailLists, total, page, pages: Math.ceil(total / limit) }
  }
}
