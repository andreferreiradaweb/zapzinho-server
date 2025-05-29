import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { CreateCompanyUseCase } from '@/use-cases/company/create-company'

export function MakeCreateCompanyUseCase() {
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const createCompanyUseCase = new CreateCompanyUseCase(
    prismaUserRepository,
    prismaCompanyRepository,
  )
  return createCompanyUseCase
}
