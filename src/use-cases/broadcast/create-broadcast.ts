import { Broadcast, LeadStatus } from '@/lib/prisma'
import { BroadcastRepository } from '@/repositories/broadcast'
import { LeadRepository } from '@/repositories/lead'
import { v4 as uuid } from 'uuid'

interface CreateBroadcastRequest {
  userId: string
  name: string
  message: string
  templateId?: string
  leadIds?: string[]
  productId?: string
  status?: LeadStatus
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
  ) {}

  async execute(data: CreateBroadcastRequest): Promise<CreateBroadcastResponse> {
    const broadcast = await this.broadcastRepository.create({
      id: uuid(),
      userId: data.userId,
      name: data.name,
      message: data.message,
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
      )
      leadIds = leads.map((l) => l.id)
    }

    if (leadIds.length > 0) {
      await this.broadcastRepository.addLeads(broadcast.id, leadIds)
    }

    return { broadcast, recipientCount: leadIds.length }
  }
}
