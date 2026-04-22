import { BroadcastBlockRepository } from '@/repositories/broadcast-block'

export class AddBroadcastBlockUseCase {
  constructor(private blockRepository: BroadcastBlockRepository) {}

  async execute(userId: string, phone: string, name?: string) {
    const block = await this.blockRepository.add(userId, phone, name)
    return { block }
  }
}
