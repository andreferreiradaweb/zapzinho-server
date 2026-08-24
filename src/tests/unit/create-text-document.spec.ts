import { describe, it, expect, beforeEach } from 'vitest'
import { CreateTextDocumentUseCase } from '@/use-cases/document/create-text-document'
import { InMemoryDocumentRepository } from '@/tests/repositories/in-memory-document-repository'

describe('CreateTextDocumentUseCase', () => {
  let documentRepo: InMemoryDocumentRepository
  let sut: CreateTextDocumentUseCase

  beforeEach(() => {
    documentRepo = new InMemoryDocumentRepository()
    sut = new CreateTextDocumentUseCase(documentRepo)
  })

  it('cria documento de texto já processado', async () => {
    const document = await sut.execute({
      userId: 'user-1',
      title: 'Política de troca',
      content: 'Trocas em até 7 dias com nota fiscal.',
    })

    expect(document.title).toBe('Política de troca')
    expect(document.sourceType).toBe('TEXT')
    expect(document.status).toBe('PROCESSED')
    expect(document.content).toBe('Trocas em até 7 dias com nota fiscal.')
    expect(documentRepo.items).toHaveLength(1)
  })
})
