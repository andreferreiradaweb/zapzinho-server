import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeleteDocumentUseCase } from '@/use-cases/document/delete-document'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { InMemoryDocumentRepository } from '@/tests/repositories/in-memory-document-repository'

vi.mock('@/services/cloudinary', () => ({
  deleteFromCloudinary: vi.fn().mockResolvedValue(undefined),
}))

describe('DeleteDocumentUseCase', () => {
  let documentRepo: InMemoryDocumentRepository
  let sut: DeleteDocumentUseCase

  beforeEach(async () => {
    documentRepo = new InMemoryDocumentRepository()
    sut = new DeleteDocumentUseCase(documentRepo)
  })

  it('deleta documento do dono', async () => {
    const document = await documentRepo.create({
      userId: 'user-1',
      title: 'Doc',
      sourceType: 'TEXT',
      content: 'conteúdo',
      status: 'PROCESSED',
    })

    await sut.execute(document.id, 'user-1')

    expect(documentRepo.items).toHaveLength(0)
  })

  it('lança ResourceNotFound se documento não existir', async () => {
    await expect(sut.execute('id-fantasma', 'user-1')).rejects.toThrow(ResourceNotFound)
  })

  it('lança InvalidCredentialsError se documento for de outro usuário', async () => {
    const document = await documentRepo.create({
      userId: 'user-1',
      title: 'Doc',
      sourceType: 'TEXT',
      content: 'conteúdo',
      status: 'PROCESSED',
    })

    await expect(sut.execute(document.id, 'user-2')).rejects.toThrow(InvalidCredentialsError)
  })
})
