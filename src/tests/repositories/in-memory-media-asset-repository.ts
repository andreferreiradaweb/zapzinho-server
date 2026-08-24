import { MediaAssetRepository } from '@/repositories/media-asset'
import { v4 as uuid } from 'uuid'

type MediaAssetRecord = {
  id: string
  userId: string
  type: 'IMAGE' | 'VIDEO' | 'AUDIO'
  url: string
  title: string
  description: string | null
  productId: string | null
  categoryId: string | null
  createdAt: Date
}

export class InMemoryMediaAssetRepository implements MediaAssetRepository {
  public items: MediaAssetRecord[] = []

  async findById(id: string) {
    return this.items.find((m) => m.id === id) ?? null
  }

  async findAllByUserId(userId: string) {
    return this.items.filter((m) => m.userId === userId)
  }

  async listCandidatesForRag(userId: string, limit: number) {
    return this.items.filter((m) => m.userId === userId).slice(0, limit)
  }

  async create(data: any) {
    const media: MediaAssetRecord = {
      id: data.id ?? uuid(),
      userId: data.userId,
      type: data.type,
      url: data.url,
      title: data.title,
      description: data.description ?? null,
      productId: data.productId ?? null,
      categoryId: data.categoryId ?? null,
      createdAt: new Date(),
    }
    this.items.push(media)
    return media
  }

  async delete(id: string) {
    const idx = this.items.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('MediaAsset not found')
    const [media] = this.items.splice(idx, 1)
    return media
  }
}
