import { PrismaTransactionProvider } from '@/helpers/prisma/transaction'
import { PrismaHouseRepository } from '@/repositories/prisma/product'
import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { DeleteUserUseCase } from '@/use-cases/user/delete-user'

export function DeleteUserFactory() {
  const prismaUserRepository = new PrismaUserRepository()
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const prismaHouseRepository = new PrismaHouseRepository()
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaTransactionProvider = new PrismaTransactionProvider()
  const deletedUserUseCase = new DeleteUserUseCase(
    prismaUserRepository,
    prismaCompanyRepository,
    prismaHouseRepository,
    prismaLeadRepository,
    prismaTransactionProvider,
  )
  return deletedUserUseCase
}
