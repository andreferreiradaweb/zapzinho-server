import { PrismaUserRepository } from '@/repositories/prisma/user'
import { VerifyEmailUseCase } from '@/use-cases/user/verify-email'

export function MakeVerifyEmailUseCase() {
  const prismaUserRepository = new PrismaUserRepository()
  return new VerifyEmailUseCase(prismaUserRepository)
}
