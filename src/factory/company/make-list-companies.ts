import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { ListCompaniesUseCase } from '@/use-cases/company/list-companies'
import { PrismaUserRepository } from '@/repositories/prisma/user'

export function MakeListCompaniesUseCase() {
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const listCompaniesUseCase = new ListCompaniesUseCase(
    prismaCompanyRepository,
    prismaUserRepository,
  )
  return listCompaniesUseCase
}
