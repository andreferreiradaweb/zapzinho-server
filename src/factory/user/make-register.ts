import { PrismaUserRepository } from '@/repositories/prisma/user'
import { RegisterUserUseCase } from '@/use-cases/user/register'
import { PrismaTransactionProvider } from '@/helpers/prisma/transaction'
import { PrismaCompanyRepository } from '@/repositories/prisma/company'

export function MakeRegisterUseCase() {
  const prismaUserRepository = new PrismaUserRepository()
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const prismaTransactionProvider = new PrismaTransactionProvider()
  const registerUseCase = new RegisterUserUseCase(
    prismaUserRepository,
    prismaCompanyRepository,
    prismaTransactionProvider,
  )
  return registerUseCase
}
