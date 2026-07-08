import { EmailListRepository } from '@/repositories/email'

export class CreateEmailListUseCase {
  constructor(private repo: EmailListRepository) {}

  async execute(userId: string, name: string) {
    const emailList = await this.repo.create({ userId, name })
    return { emailList }
  }
}
