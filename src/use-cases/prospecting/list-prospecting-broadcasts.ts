import { ProspectingBroadcastRepository } from '@/repositories/prospecting'

export class ListProspectingBroadcastsUseCase {
  constructor(private repo: ProspectingBroadcastRepository) {}

  async execute(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [broadcasts, totalItems] = await Promise.all([
      this.repo.findAllByUserId(userId, offset, limit),
      this.repo.countByUserId(userId),
    ])
    return { broadcasts, totalItems }
  }
}
