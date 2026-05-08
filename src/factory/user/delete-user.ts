import { PrismaUserRepository } from '@/repositories/prisma/user'
import { DeleteUserUseCase } from '@/use-cases/user/delete-user'

export function DeleteUserFactory() {
  return new DeleteUserUseCase(new PrismaUserRepository())
}
