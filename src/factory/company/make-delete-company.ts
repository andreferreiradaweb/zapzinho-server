import { PrismaHouseRepository } from '@/repositories/prisma/product'
import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { DeleteCompanyUseCase } from '@/use-cases/company/delete-company'

export function MakeDeleteCompanyUseCase() {
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const prismaHouseRepository = new PrismaHouseRepository()
  const deleteCompanyUseCase = new DeleteCompanyUseCase(
    prismaCompanyRepository,
    prismaUserRepository,
    prismaHouseRepository,
  )
  return deleteCompanyUseCase
}
