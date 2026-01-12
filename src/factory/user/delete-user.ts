import { PrismaTransactionProvider } from '@/helpers/prisma/transaction'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaProductRepository } from '@/repositories/prisma/product'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { DeleteUserUseCase } from '@/use-cases/user/delete-user'

export function DeleteUserFactory() {
  const prismaUserRepository = new PrismaUserRepository()
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaProductRepository = new PrismaProductRepository()
  const prismaTransactionProvider = new PrismaTransactionProvider()
  const deletedUserUseCase = new DeleteUserUseCase(
    prismaUserRepository,
    prismaProductRepository,
    prismaLeadRepository,
    prismaTransactionProvider,
  )
  return deletedUserUseCase
}
