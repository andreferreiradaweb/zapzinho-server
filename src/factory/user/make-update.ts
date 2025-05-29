import { PrismaUserRepository } from '@/repositories/prisma/user'
import { UpdateUserUseCase } from '@/use-cases/user/update-user'

export function MakeUpdateUseCase() {
  const prismaUserRepository = new PrismaUserRepository()
  const updateUseCase = new UpdateUserUseCase(prismaUserRepository)
  return updateUseCase
}
