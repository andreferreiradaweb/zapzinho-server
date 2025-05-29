import { PrismaUserRepository } from '@/repositories/prisma/user'
import { AuthenticateUseCase } from '@/use-cases/user/authenticate'

export function MakeAuthenticateUseCase() {
  const prismaUserRepository = new PrismaUserRepository()
  const registerUseCase = new AuthenticateUseCase(prismaUserRepository)
  return registerUseCase
}
