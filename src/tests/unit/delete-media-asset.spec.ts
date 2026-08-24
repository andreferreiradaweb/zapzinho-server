import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeleteMediaAssetUseCase } from '@/use-cases/media-asset/delete-media-asset'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { InMemoryMediaAssetRepository } from '@/tests/repositories/in-memory-media-asset-repository'

vi.mock('@/services/cloudinary', () => ({
  deleteFromCloudinary: vi.fn().mockResolvedValue(undefined),
}))

describe('DeleteMediaAssetUseCase', () => {
  let mediaRepo: InMemoryMediaAssetRepository
  let sut: DeleteMediaAssetUseCase

  beforeEach(() => {
    mediaRepo = new InMemoryMediaAssetRepository()
    sut = new DeleteMediaAssetUseCase(mediaRepo)
  })

  it('deleta mídia do dono', async () => {
    const media = await mediaRepo.create({
      userId: 'user-1',
      type: 'IMAGE',
      url: 'https://cdn.test/foto.jpg',
      title: 'Foto',
    })

    await sut.execute(media.id, 'user-1')

    expect(mediaRepo.items).toHaveLength(0)
  })

  it('lança ResourceNotFound se mídia não existir', async () => {
    await expect(sut.execute('id-fantasma', 'user-1')).rejects.toThrow(ResourceNotFound)
  })

  it('lança InvalidCredentialsError se mídia for de outro usuário', async () => {
    const media = await mediaRepo.create({
      userId: 'user-1',
      type: 'IMAGE',
      url: 'https://cdn.test/foto.jpg',
      title: 'Foto',
    })

    await expect(sut.execute(media.id, 'user-2')).rejects.toThrow(InvalidCredentialsError)
  })
})
