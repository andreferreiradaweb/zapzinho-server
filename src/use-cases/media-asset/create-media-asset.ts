import { MediaAsset, MediaType } from '@/lib/prisma'
import { MediaAssetRepository } from '@/repositories/media-asset'
import { v4 as uuid } from 'uuid'

interface CreateMediaAssetRequest {
  userId: string
  type: MediaType
  url: string
  title: string
  description?: string
  productId?: string
  categoryId?: string
}

export class CreateMediaAssetUseCase {
  constructor(private repo: MediaAssetRepository) {}

  async execute(data: CreateMediaAssetRequest): Promise<MediaAsset> {
    return this.repo.create({ id: uuid(), ...data })
  }
}
