import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaHouseRepository } from '@/repositories/prisma/product'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { CreateLeadUseCase } from '@/use-cases/lead/create-lead'

export function CreateLeadFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const prismaHouseRepository = new PrismaHouseRepository()
  const createLeadUseCase = new CreateLeadUseCase(
    prismaLeadRepository,
    prismaCompanyRepository,
    prismaHouseRepository
  )
  return createLeadUseCase
}
