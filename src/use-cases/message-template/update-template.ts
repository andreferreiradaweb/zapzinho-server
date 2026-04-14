import { MessageTemplate } from '@/lib/prisma'
import { MessageTemplateRepository } from '@/repositories/message-template'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

interface UpdateTemplateRequest {
  id: string
  userId: string
  name?: string
  content?: string
  category?: string
}

export class UpdateTemplateUseCase {
  constructor(private repo: MessageTemplateRepository) {}

  async execute(data: UpdateTemplateRequest): Promise<MessageTemplate> {
    const template = await this.repo.findById(data.id)
    if (!template) throw new ResourceNotFound()
    if (template.userId !== data.userId) throw new InvalidCredentialsError()
    return this.repo.update({ id: data.id, name: data.name, content: data.content, category: data.category })
  }
}
