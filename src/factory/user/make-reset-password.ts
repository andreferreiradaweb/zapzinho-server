import { PrismaUserRepository } from '@/repositories/prisma/user'
import { ResetPasswordUseCase } from '@/use-cases/user/reset-password'

export function MakeResetPasswordUseCase() {
  const prismaUserRepository = new PrismaUserRepository()
  return new ResetPasswordUseCase(prismaUserRepository)
}
