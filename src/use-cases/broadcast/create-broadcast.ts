import { Broadcast, LeadStatus } from '@/lib/prisma'
import { BroadcastRepository } from '@/repositories/broadcast'
import { BroadcastBlockRepository } from '@/repositories/broadcast-block'
import { LeadRepository } from '@/repositories/lead'
import { v4 as uuid } from 'uuid'

interface CreateBroadcastRequest {
  userId: string
  name: string
  message: string
  imageUrls?: string[]
  videoUrl?: string | null
  templateId?: string
  leadIds?: string[]
  productId?: string
  categoryId?: string
  status?: LeadStatus
  lastMessageRange?: string
  lastBroadcastRange?: string
  scheduledAt?: Date
}

interface CreateBroadcastResponse {
  broadcast: Broadcast
  recipientCount: number
}

export class CreateBroadcastUseCase {
  constructor(
    private broadcastRepository: BroadcastRepository,
    private leadRepository: LeadRepository,
    private blockRepository: BroadcastBlockRepository,
  ) {}

  async execute(data: CreateBroadcastRequest): Promise<CreateBroadcastResponse> {
    const broadcast = await this.broadcastRepository.create({
      id: uuid(),
      userId: data.userId,
      name: data.name,
      message: data.message,
      imageUrls: data.imageUrls ?? [],
      videoUrl: data.videoUrl ?? null,
      templateId: data.templateId,
      scheduledAt: data.scheduledAt,
      status: 'DRAFT',
    })

    let leadIds: string[] = data.leadIds ?? []

    if (leadIds.length === 0) {
      const leads = await this.leadRepository.findAllForBroadcast(
        data.userId,
        data.productId,
        data.status,
        data.lastMessageRange,
        data.lastBroadcastRange,
        data.categoryId,
      )
      leadIds = leads.map((l) => l.id)
    }

    const blockedIds = await this.blockRepository.findBlockedLeadIds(data.userId)
    const blockedSet = new Set(blockedIds)
    leadIds = leadIds.filter((id) => !blockedSet.has(id))

    if (leadIds.length > 0) {
      await this.broadcastRepository.addLeads(broadcast.id, leadIds)
    }

    return { broadcast, recipientCount: leadIds.length }
  }
}
