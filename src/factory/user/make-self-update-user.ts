import { PrismaUserRepository } from '@/repositories/prisma/user'
import { SelfUpdateUserUseCase } from '@/use-cases/user/self-update-user'

export function MakeSelfUpdateUseCase() {
  const prismaUserRepository = new PrismaUserRepository()
  const updateUseCase = new SelfUpdateUserUseCase(prismaUserRepository)
  return updateUseCase
}
