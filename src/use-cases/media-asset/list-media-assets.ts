import { MediaAsset } from '@/lib/prisma'
import { MediaAssetRepository } from '@/repositories/media-asset'

export class ListMediaAssetsUseCase {
  constructor(private repo: MediaAssetRepository) {}

  async execute(userId: string): Promise<MediaAsset[]> {
    return this.repo.findAllByUserId(userId)
  }
}
