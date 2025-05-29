import { PrismaUserRepository } from '@/repositories/prisma/user'
import { GetOneUserUseCase } from '@/use-cases/user/get-one-user'

export function GetOneUserFactory() {
  const prismaUserRepository = new PrismaUserRepository()
  const getOneUserUseCase = new GetOneUserUseCase(prismaUserRepository)
  return getOneUserUseCase
}
