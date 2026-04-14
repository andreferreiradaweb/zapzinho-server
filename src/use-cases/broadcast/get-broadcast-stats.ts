import { BroadcastRepository, BroadcastWithLeads } from '@/repositories/broadcast'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class GetBroadcastStatsUseCase {
  constructor(private broadcastRepository: BroadcastRepository) {}

  async execute(id: string, userId: string): Promise<BroadcastWithLeads> {
    const broadcast = await this.broadcastRepository.findById(id)
    if (!broadcast) throw new ResourceNotFound()
    if (broadcast.userId !== userId) throw new InvalidCredentialsError()
    return broadcast
  }
}
