import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { UpdateLeadUseCase } from '@/use-cases/lead/update-lead'

export function UpdateLeadFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const updateLeadUseCase = new UpdateLeadUseCase(
    prismaLeadRepository,
    prismaCompanyRepository,
  )
  return updateLeadUseCase
}
