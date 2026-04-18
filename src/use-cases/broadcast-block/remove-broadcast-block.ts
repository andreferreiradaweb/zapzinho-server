import { BroadcastBlockRepository } from '@/repositories/broadcast-block'

export class RemoveBroadcastBlockUseCase {
  constructor(private blockRepository: BroadcastBlockRepository) {}

  async execute(userId: string, leadId: string) {
    await this.blockRepository.remove(userId, leadId)
  }
}
