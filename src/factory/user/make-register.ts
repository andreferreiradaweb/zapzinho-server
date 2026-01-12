import { PrismaUserRepository } from '@/repositories/prisma/user'
import { RegisterUserUseCase } from '@/use-cases/user/register'

export function MakeRegisterUseCase() {
  const prismaUserRepository = new PrismaUserRepository()
  const registerUseCase = new RegisterUserUseCase(
    prismaUserRepository,
  )
  return registerUseCase
}
