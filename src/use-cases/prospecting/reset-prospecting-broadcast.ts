import { ContactListRepository, ProspectingBroadcastRepository } from '@/repositories/prospecting'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class ResetProspectingBroadcastUseCase {
  constructor(
    private broadcastRepo: ProspectingBroadcastRepository,
    private contactListRepo: ContactListRepository,
  ) {}

  async execute(broadcastId: string, userId: string): Promise<void> {
    const broadcast = await this.broadcastRepo.getStatusById(broadcastId)
    if (!broadcast) throw new ResourceNotFound()
    if (broadcast.userId !== userId) throw new InvalidCredentialsError()
    if (broadcast.status === 'SENDING') {
      throw new Error('Não é possível reiniciar um disparo em andamento.')
    }

    await this.contactListRepo.resetContactsByListId(broadcast.contactListId)
    await this.broadcastRepo.reset(broadcastId)
  }
}
