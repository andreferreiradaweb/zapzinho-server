import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { CreateLeadForAdminUseCase } from '@/use-cases/lead/create-lead-for-admin'

export function CreateLeadForAdminFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const createLeadUseCase = new CreateLeadForAdminUseCase(
    prismaLeadRepository,
    prismaCompanyRepository,
  )
  return createLeadUseCase
}
