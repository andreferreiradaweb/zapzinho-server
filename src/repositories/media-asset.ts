import { MediaAsset, Prisma } from '@/lib/prisma'

export interface MediaAssetRepository {
  findById(id: string): Promise<MediaAsset | null>
  findAllByUserId(userId: string): Promise<MediaAsset[]>
  listCandidatesForRag(userId: string, limit: number): Promise<MediaAsset[]>
  create(data: Prisma.MediaAssetUncheckedCreateInput): Promise<MediaAsset>
  delete(id: string): Promise<MediaAsset>
}
