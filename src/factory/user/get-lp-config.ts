import { PrismaUserRepository } from '@/repositories/prisma/user'
import { GetLpConfigUseCase } from '@/use-cases/user/get-lp-config'

export function GetLpConfigFactory() {
  const userRepository = new PrismaUserRepository()
  return new GetLpConfigUseCase(userRepository)
}
