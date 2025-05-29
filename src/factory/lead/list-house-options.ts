import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { ListHouseOptionsUseCase } from '@/use-cases/lead/list-house-options'

export function ListHouseOptionsFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const createLeadUseCase = new ListHouseOptionsUseCase(
    prismaLeadRepository,
    prismaCompanyRepository,
    prismaUserRepository,
  )
  return createLeadUseCase
}
