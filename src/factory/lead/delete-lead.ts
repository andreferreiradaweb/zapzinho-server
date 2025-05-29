import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { DeleteLeadUseCase } from '@/use-cases/lead/delete-lead'

export function DeleteLeadFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const deleteLeadUseCase = new DeleteLeadUseCase(
    prismaLeadRepository,
    prismaCompanyRepository,
  )
  return deleteLeadUseCase
}
