import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RegisterUserUseCase } from '@/use-cases/user/register'
import { UserAlreadyExistsError } from '@/error/user-already-exists-error'
import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'

vi.mock('@/services/wapi', () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue({ success: false }),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { update: vi.fn().mockResolvedValue({}) },
    messageLog: { create: vi.fn().mockResolvedValue({}) },
  },
  CustomerType: { B2C: 'B2C', B2B: 'B2B' },
  Role: { ADMIN: 'ADMIN', CLIENT: 'CLIENT' },
  UserPlan: { PADRAO: 'PADRAO', EXPERT: 'EXPERT', VIP: 'VIP' },
}))

describe('RegisterUserUseCase', () => {
  let repo: InMemoryUserRepository
  let sut: RegisterUserUseCase

  beforeEach(() => {
    repo = new InMemoryUserRepository()
    sut = new RegisterUserUseCase(repo)
  })

  it('registra um novo usuário com sucesso', async () => {
    const { user } = await sut.execute({
      email: 'novo@email.com',
      password: 'Senha123',
      role: 'CLIENT' as any,
      isActive: false,
    })

    expect(user.email).toBe('novo@email.com')
    expect(repo.items).toHaveLength(1)
  })

  it('lança UserAlreadyExistsError se e-mail já está cadastrado', async () => {
    await sut.execute({
      email: 'existente@email.com',
      password: 'Senha123',
      role: 'CLIENT' as any,
      isActive: false,
    })

    await expect(
      sut.execute({
        email: 'existente@email.com',
        password: 'Senha456',
        role: 'CLIENT' as any,
        isActive: false,
      }),
    ).rejects.toThrow(UserAlreadyExistsError)
  })

  it('hasheia a senha antes de salvar', async () => {
    await sut.execute({
      email: 'joao@email.com',
      password: 'Senha123',
      role: 'CLIENT' as any,
      isActive: false,
    })

    const saved = repo.items[0]
    expect(saved.passwordHash).not.toBe('Senha123')
    expect(saved.passwordHash).toMatch(/^\$2[aby]\$/)
  })

  it('emailVerified começa como false', async () => {
    const { user } = await sut.execute({
      email: 'joao@email.com',
      password: 'Senha123',
      role: 'CLIENT' as any,
      isActive: false,
    })

    expect(user.emailVerified).toBe(false)
  })
})
