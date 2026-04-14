import { Broadcast } from '@/lib/prisma'
import { BroadcastRepository } from '@/repositories/broadcast'

interface ListBroadcastsRequest {
  userId: string
  page: number
  limit: number
}

interface ListBroadcastsResponse {
  broadcasts: Broadcast[]
  totalItems: number
}

export class ListBroadcastsUseCase {
  constructor(private broadcastRepository: BroadcastRepository) {}

  async execute({ userId, page, limit }: ListBroadcastsRequest): Promise<ListBroadcastsResponse> {
    const offset = (page - 1) * limit
    const [broadcasts, totalItems] = await Promise.all([
      this.broadcastRepository.findAllByUserId(userId, offset, limit),
      this.broadcastRepository.countByUserId(userId),
    ])
    return { broadcasts, totalItems }
  }
}
