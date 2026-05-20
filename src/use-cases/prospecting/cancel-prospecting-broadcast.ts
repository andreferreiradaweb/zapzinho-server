import { ProspectingBroadcastRepository } from '@/repositories/prospecting'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class CancelProspectingBroadcastUseCase {
  constructor(
    private broadcastRepository: ProspectingBroadcastRepository,
  ) {}

  async execute(broadcastId: string, userId: string): Promise<void> {
    const broadcast = await this.broadcastRepository.getStatusById(broadcastId)
    if (!broadcast) throw new ResourceNotFound()
    if (broadcast.userId !== userId) throw new InvalidCredentialsError()
    if (broadcast.status !== 'SENDING') {
      throw new Error('Somente disparos em andamento podem ser interrompidos.')
    }
    await this.broadcastRepository.updateStatus(broadcastId, 'DRAFT')
  }
}
