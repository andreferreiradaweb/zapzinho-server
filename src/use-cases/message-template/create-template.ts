import { MessageTemplate } from '@/lib/prisma'
import { MessageTemplateRepository } from '@/repositories/message-template'
import { checkInactiveLimit } from '@/helpers/checkInactiveLimit'
import { prisma } from '@/lib/prisma'
import { v4 as uuid } from 'uuid'

interface CreateTemplateRequest {
  userId: string
  name: string
  content: string
  category?: string
  imageUrl?: string | null
  videoUrl?: string | null
}

export class CreateTemplateUseCase {
  constructor(private repo: MessageTemplateRepository) {}

  async execute(data: CreateTemplateRequest): Promise<MessageTemplate> {
    await checkInactiveLimit(data.userId, () =>
      prisma.messageTemplate.count({ where: { userId: data.userId } }),
    )
    return this.repo.create({ id: uuid(), ...data })
  }
}
