import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { GetOneCompanyUseCase } from '@/use-cases/company/get-one-company'
import { PrismaUserRepository } from '@/repositories/prisma/user'

export function MakeGetOneCompanyUseCase() {
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const getOneCompanyUseCase = new GetOneCompanyUseCase(
    prismaCompanyRepository,
    prismaUserRepository,
  )
  return getOneCompanyUseCase
}
