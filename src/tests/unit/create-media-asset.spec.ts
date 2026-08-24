import { describe, it, expect, beforeEach } from 'vitest'
import { CreateMediaAssetUseCase } from '@/use-cases/media-asset/create-media-asset'
import { InMemoryMediaAssetRepository } from '@/tests/repositories/in-memory-media-asset-repository'

describe('CreateMediaAssetUseCase', () => {
  let mediaRepo: InMemoryMediaAssetRepository
  let sut: CreateMediaAssetUseCase

  beforeEach(() => {
    mediaRepo = new InMemoryMediaAssetRepository()
    sut = new CreateMediaAssetUseCase(mediaRepo)
  })

  it('cria mídia com sucesso', async () => {
    const media = await sut.execute({
      userId: 'user-1',
      type: 'IMAGE',
      url: 'https://cdn.test/foto.jpg',
      title: 'Foto da loja',
      description: 'Foto da fachada da loja física',
    })

    expect(media.type).toBe('IMAGE')
    expect(media.title).toBe('Foto da loja')
    expect(mediaRepo.items).toHaveLength(1)
  })
})
