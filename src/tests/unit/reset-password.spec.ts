import { describe, it, expect, beforeEach, vi } from 'vitest'
import { compare } from 'bcrypt'
import { ResetPasswordUseCase } from '@/use-cases/user/reset-password'
import { InvalidResetCodeError } from '@/error/invalid-reset-code'
import { UserNotFound } from '@/error/user-not-found'
import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'

vi.mock('@/lib/resend', () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({}) } },
}))

describe('ResetPasswordUseCase', () => {
  let repo: InMemoryUserRepository
  let sut: ResetPasswordUseCase

  beforeEach(async () => {
    repo = new InMemoryUserRepository()
    sut = new ResetPasswordUseCase(repo)

    await repo.create({
      id: 'user-1',
      email: 'joao@email.com',
      passwordHash: 'hash-antigo',
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
    })
  })

  it('lança UserNotFound para e-mail inexistente', async () => {
    await expect(
      sut.execute({ email: 'naoexiste@email.com', code: '123456', newPassword: 'Nova123' }),
    ).rejects.toThrow(UserNotFound)
  })

  it('lança InvalidResetCodeError para código incorreto', async () => {
    await expect(
      sut.execute({ email: 'joao@email.com', code: '000000', newPassword: 'Nova123' }),
    ).rejects.toThrow(InvalidResetCodeError)
  })

  it('redefine a senha com código correto', async () => {
    const { resetCodeCache } = await import('@/use-cases/user/forgot-password')
    resetCodeCache.set('joao@email.com', '999888')

    await sut.execute({ email: 'joao@email.com', code: '999888', newPassword: 'NovaSenha1' })

    const updated = repo.items.find((u) => u.email === 'joao@email.com')
    const matches = await compare('NovaSenha1', updated!.passwordHash)
    expect(matches).toBe(true)
  })

  it('invalida o código após uso', async () => {
    const { resetCodeCache } = await import('@/use-cases/user/forgot-password')
    resetCodeCache.set('joao@email.com', '555444')

    await sut.execute({ email: 'joao@email.com', code: '555444', newPassword: 'NovaSenha1' })

    await expect(
      sut.execute({ email: 'joao@email.com', code: '555444', newPassword: 'OutraSenha1' }),
    ).rejects.toThrow(InvalidResetCodeError)
  })
})
