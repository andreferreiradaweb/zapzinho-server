import { MessageTemplate } from '@/lib/prisma'
import { MessageTemplateRepository } from '@/repositories/message-template'
import { v4 as uuid } from 'uuid'

interface CreateTemplateRequest {
  userId: string
  name: string
  content: string
  category?: string
}

export class CreateTemplateUseCase {
  constructor(private repo: MessageTemplateRepository) {}

  async execute(data: CreateTemplateRequest): Promise<MessageTemplate> {
    return this.repo.create({ id: uuid(), ...data })
  }
}
