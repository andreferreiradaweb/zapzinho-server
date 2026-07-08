import { EmailListRepository } from '@/repositories/email'

export class ListEmailListsUseCase {
  constructor(private repo: EmailListRepository) {}

  async execute(userId: string) {
    const emailLists = await this.repo.findAllByUserId(userId)
    return { emailLists }
  }
}
