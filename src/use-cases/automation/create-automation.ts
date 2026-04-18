import { Automation, LeadStatus } from '@/lib/prisma'
import { AutomationRepository } from '@/repositories/automation'
import { v4 as uuid } from 'uuid'

interface Request {
  userId: string
  name: string
  message: string
  imageUrls?: string[]
  videoUrl?: string | null
  templateId?: string
  productId?: string
  categoryId?: string
  leadStatus?: LeadStatus
  lastMessageRange?: string
  lastBroadcastRange?: string
}

export class CreateAutomationUseCase {
  constructor(private automationRepository: AutomationRepository) {}

  async execute(data: Request): Promise<Automation> {
    return this.automationRepository.create({
      id: uuid(),
      userId: data.userId,
      name: data.name,
      message: data.message,
      imageUrls: data.imageUrls ?? [],
      videoUrl: data.videoUrl ?? null,
      templateId: data.templateId,
      productId: data.productId,
      categoryId: data.categoryId,
      leadStatus: data.leadStatus,
      lastMessageRange: data.lastMessageRange,
      lastBroadcastRange: data.lastBroadcastRange,
      isActive: false,
    })
  }
}
