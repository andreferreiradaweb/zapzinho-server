import { Prisma, prisma } from '@/lib/prisma'
import { MediaAssetRepository } from '../media-asset'

export class PrismaMediaAssetRepository implements MediaAssetRepository {
  async findById(id: string) {
    return prisma.mediaAsset.findUnique({ where: { id } })
  }

  async findAllByUserId(userId: string) {
    return prisma.mediaAsset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async listCandidatesForRag(userId: string, limit: number) {
    return prisma.mediaAsset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async create(data: Prisma.MediaAssetUncheckedCreateInput) {
    return prisma.mediaAsset.create({ data })
  }

  async delete(id: string) {
    return prisma.mediaAsset.delete({ where: { id } })
  }
}
