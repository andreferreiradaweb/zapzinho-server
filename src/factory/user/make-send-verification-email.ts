import { PrismaUserRepository } from '@/repositories/prisma/user'
import { SendVerificationEmailUseCase } from '@/use-cases/user/send-verification-email'

export function MakeSendVerificationEmailUseCase() {
  const prismaUserRepository = new PrismaUserRepository()
  return new SendVerificationEmailUseCase(prismaUserRepository)
}
