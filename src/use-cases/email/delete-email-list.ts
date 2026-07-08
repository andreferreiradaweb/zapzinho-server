import { EmailListRepository } from '@/repositories/email'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class DeleteEmailListUseCase {
  constructor(private repo: EmailListRepository) {}

  async execute(id: string, userId: string) {
    const list = await this.repo.findById(id)
    if (!list) throw new ResourceNotFound()
    if (list.userId !== userId) throw new InvalidCredentialsError()
    await this.repo.delete(id)
  }
}
