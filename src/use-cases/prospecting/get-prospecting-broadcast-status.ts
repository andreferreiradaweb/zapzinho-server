import { ProspectingBroadcastRepository } from '@/repositories/prospecting'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class GetProspectingBroadcastStatusUseCase {
  constructor(private repo: ProspectingBroadcastRepository) {}

  async execute(broadcastId: string, userId: string) {
    const broadcast = await this.repo.getStatusById(broadcastId)
    if (!broadcast) throw new ResourceNotFound()
    if (broadcast.userId !== userId) throw new InvalidCredentialsError()
    return { broadcast }
  }
}
