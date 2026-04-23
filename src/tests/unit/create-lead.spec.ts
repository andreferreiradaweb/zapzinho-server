import { describe, it, expect, beforeEach } from 'vitest'
import { CreateLeadUseCase } from '@/use-cases/lead/create-lead'
import { ResourceNotFound } from '@/error/resource-not-found'
import { UserAlreadyExistsError } from '@/error/user-already-exists-error'
import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'
import { InMemoryLeadRepository } from '@/tests/repositories/in-memory-lead-repository'

describe('CreateLeadUseCase', () => {
  let userRepo: InMemoryUserRepository
  let leadRepo: InMemoryLeadRepository
  let sut: CreateLeadUseCase

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository()
    leadRepo = new InMemoryLeadRepository()
    sut = new CreateLeadUseCase(leadRepo, userRepo)

    await userRepo.create({
      id: 'user-1',
      email: 'empresa@email.com',
      passwordHash: 'hash',
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
    })
  })

  it('cria um lead com sucesso', async () => {
    const { lead } = await sut.execute({
      nome: 'Maria Silva',
      telefone: '11999990000',
      message: 'Interesse no produto',
      Status: 'NOVO_INTERESSE' as any,
      userId: 'user-1',
    })

    expect(lead.nome).toBe('Maria Silva')
    expect(leadRepo.items).toHaveLength(1)
  })

  it('lança ResourceNotFound se o userId não existir', async () => {
    await expect(
      sut.execute({
        nome: 'Fulano',
        telefone: '11999990001',
        message: 'Teste',
        Status: 'NOVO_INTERESSE' as any,
        userId: 'usuario-inexistente',
      }),
    ).rejects.toThrow(ResourceNotFound)
  })

  it('lança UserAlreadyExistsError se o telefone já existe para o usuário', async () => {
    await sut.execute({
      nome: 'Maria Silva',
      telefone: '11999990000',
      message: 'Primeiro cadastro',
      Status: 'NOVO_INTERESSE' as any,
      userId: 'user-1',
    })

    await expect(
      sut.execute({
        nome: 'Maria Duplicada',
        telefone: '(11) 99999-0000',
        message: 'Segundo cadastro',
        Status: 'NOVO_INTERESSE' as any,
        userId: 'user-1',
      }),
    ).rejects.toThrow(UserAlreadyExistsError)
  })

  it('salva o productId do primeiro item quando items é fornecido', async () => {
    const { lead } = await sut.execute({
      nome: 'Carlos',
      telefone: '11988887777',
      message: 'Interesse',
      Status: 'NOVO_INTERESSE' as any,
      userId: 'user-1',
      items: [{ productId: 'prod-abc', quantity: 2 }],
    })

    expect(lead.productId).toBe('prod-abc')
  })
})
