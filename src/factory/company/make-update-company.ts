import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { UpdateCompanyUseCase } from '@/use-cases/company/update-company'

export function MakeUpdateCompanyUseCase() {
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const updateCompanyUseCase = new UpdateCompanyUseCase(prismaCompanyRepository)
  return updateCompanyUseCase
}
