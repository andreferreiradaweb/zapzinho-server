import { PrismaUserRepository } from '@/repositories/prisma/user'
import { ForgotPasswordUseCase } from '@/use-cases/user/forgot-password'

export function MakeForgotPasswordUseCase() {
  const prismaUserRepository = new PrismaUserRepository()
  return new ForgotPasswordUseCase(prismaUserRepository)
}
