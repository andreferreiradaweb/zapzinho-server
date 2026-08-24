import { PrismaMediaAssetRepository } from '@/repositories/prisma/media-asset'
import { CreateMediaAssetUseCase } from '@/use-cases/media-asset/create-media-asset'

export function makeCreateMediaAsset() {
  return new CreateMediaAssetUseCase(new PrismaMediaAssetRepository())
}
