import { PrismaUserRepository } from '@/repositories/prisma/user'
import { ListUsersUseCase } from '@/use-cases/user/list-users'

export function ListUsersFactory() {
  const prismaUserRepository = new PrismaUserRepository()
  const listCarsUseCase = new ListUsersUseCase(prismaUserRepository)
  return listCarsUseCase
}
