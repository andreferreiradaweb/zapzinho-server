import { MessageTemplate } from '@/lib/prisma'
import { MessageTemplateRepository } from '@/repositories/message-template'

export class ListTemplatesUseCase {
  constructor(private repo: MessageTemplateRepository) {}

  async execute(userId: string): Promise<MessageTemplate[]> {
    return this.repo.findAllByUserId(userId)
  }
}
