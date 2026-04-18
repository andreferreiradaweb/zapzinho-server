import { BroadcastBlockRepository } from '@/repositories/broadcast-block'

export class ListBroadcastBlocksUseCase {
  constructor(private blockRepository: BroadcastBlockRepository) {}

  async execute(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [blocks, totalItems] = await Promise.all([
      this.blockRepository.findByUserId(userId, offset, limit),
      this.blockRepository.countByUserId(userId),
    ])
    return { blocks, totalItems }
  }
}
