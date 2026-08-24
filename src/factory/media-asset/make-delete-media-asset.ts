import { PrismaMediaAssetRepository } from '@/repositories/prisma/media-asset'
import { DeleteMediaAssetUseCase } from '@/use-cases/media-asset/delete-media-asset'

export function makeDeleteMediaAsset() {
  return new DeleteMediaAssetUseCase(new PrismaMediaAssetRepository())
}
