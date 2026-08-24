import { PrismaMediaAssetRepository } from '@/repositories/prisma/media-asset'
import { ListMediaAssetsUseCase } from '@/use-cases/media-asset/list-media-assets'

export function makeListMediaAssets() {
  return new ListMediaAssetsUseCase(new PrismaMediaAssetRepository())
}
