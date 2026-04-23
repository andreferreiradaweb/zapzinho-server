import { describe, it, expect, beforeEach } from 'vitest'
import { hash } from 'bcrypt'
import { AuthenticateUseCase } from '@/use-cases/user/authenticate'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { EmailNotVerifiedError } from '@/error/email-not-verified'
import { InMemoryUserRepository } from '@/tests/repositories/in-memory-user-repository'

describe('AuthenticateUseCase', () => {
  let repo: InMemoryUserRepository
  let sut: AuthenticateUseCase

  beforeEach(() => {
    repo = new InMemoryUserRepository()
    sut = new AuthenticateUseCase(repo)
  })

  it('autentica com credenciais corretas', async () => {
    await repo.create({
      id: 'user-1',
      email: 'joao@email.com',
      passwordHash: await hash('Senha123', 6),
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
    })

    const { user } = await sut.execute({ email: 'joao@email.com', password: 'Senha123' })
    expect(user.email).toBe('joao@email.com')
  })

  it('lança InvalidCredentialsError se usuário não existe', async () => {
    await expect(
      sut.execute({ email: 'naoexiste@email.com', password: 'Senha123' }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it('lança InvalidCredentialsError se a senha estiver errada', async () => {
    await repo.create({
      id: 'user-1',
      email: 'joao@email.com',
      passwordHash: await hash('Senha123', 6),
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: true,
    })

    await expect(
      sut.execute({ email: 'joao@email.com', password: 'SenhaErrada1' }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it('lança EmailNotVerifiedError se CLIENT não verificou o e-mail', async () => {
    await repo.create({
      id: 'user-1',
      email: 'joao@email.com',
      passwordHash: await hash('Senha123', 6),
      Role: 'CLIENT',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: false,
    })

    await expect(
      sut.execute({ email: 'joao@email.com', password: 'Senha123' }),
    ).rejects.toThrow(EmailNotVerifiedError)
  })

  it('ADMIN pode logar sem verificação de e-mail', async () => {
    await repo.create({
      id: 'admin-1',
      email: 'admin@email.com',
      passwordHash: await hash('Admin123', 6),
      Role: 'ADMIN',
      CustomerType: 'B2C',
      isActive: true,
      emailVerified: false,
    })

    const { user } = await sut.execute({ email: 'admin@email.com', password: 'Admin123' })
    expect(user.Role).toBe('ADMIN')
  })
})
