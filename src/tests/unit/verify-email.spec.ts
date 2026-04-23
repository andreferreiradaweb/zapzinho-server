import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VerifyEmailUseCase } from '@/use-cases/user/verify-email'
import { InvalidResetCodeError } from '@/error/invalid-reset-code'
import { UserNotFound } from '@/error/user-not-found'
import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'

vi.mock('@/lib/resend', () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({}) } },
}))

describe('VerifyEmailUseCase', () => {
  let repo: InMemoryUserRepository
  let sut: VerifyEmailUseCase

  beforeEach(async () => {
    repo = new InMemoryUserRepository()
    sut = new VerifyEmailUseCase(repo)

    await repo.create({
      id: 'user-1',
      email: 'joao@email.com',
      passwordHash: 'hash',
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: false,
      emailVerified: false,
    })
  })

  it('lança UserNotFound para e-mail inexistente', async () => {
    await expect(
      sut.execute({ email: 'naoexiste@email.com', code: '123456' }),
    ).rejects.toThrow(UserNotFound)
  })

  it('lança InvalidResetCodeError para código incorreto', async () => {
    // cache está vazio → nenhum código foi setado
    await expect(
      sut.execute({ email: 'joao@email.com', code: '000000' }),
    ).rejects.toThrow(InvalidResetCodeError)
  })

  it('verifica o e-mail com código correto', async () => {
    const { emailVerifyCache } = await import('@/use-cases/user/send-verification-email')
    emailVerifyCache.set('joao@email.com', '654321')

    await sut.execute({ email: 'joao@email.com', code: '654321' })

    const updated = repo.items.find((u) => u.email === 'joao@email.com')
    expect(updated?.emailVerified).toBe(true)
  })

  it('invalida o código após uso', async () => {
    const { emailVerifyCache } = await import('@/use-cases/user/send-verification-email')
    emailVerifyCache.set('joao@email.com', '111222')

    await sut.execute({ email: 'joao@email.com', code: '111222' })

    await expect(
      sut.execute({ email: 'joao@email.com', code: '111222' }),
    ).rejects.toThrow(InvalidResetCodeError)
  })
})
