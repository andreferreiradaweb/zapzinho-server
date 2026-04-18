import { BroadcastBlockRepository } from '@/repositories/broadcast-block'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '@/error/resource-not-found'

export class AddBroadcastBlockUseCase {
  constructor(
    private blockRepository: BroadcastBlockRepository,
    private leadRepository: LeadRepository,
  ) {}

  async execute(userId: string, leadId: string) {
    const lead = await this.leadRepository.findLeadById(leadId)
    if (!lead || lead.userId !== userId) throw new ResourceNotFound()

    const block = await this.blockRepository.add(userId, leadId)
    return { block }
  }
}
