import { MessageTemplateRepository } from '@/repositories/message-template'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class DeleteTemplateUseCase {
  constructor(private repo: MessageTemplateRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const template = await this.repo.findById(id)
    if (!template) throw new ResourceNotFound()
    if (template.userId !== userId) throw new InvalidCredentialsError()
    await this.repo.delete(id)
  }
}
