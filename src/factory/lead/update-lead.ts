import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { UpdateLeadUseCase } from '@/use-cases/lead/update-lead'

export function UpdateLeadFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const updateLeadUseCase = new UpdateLeadUseCase(
    prismaLeadRepository,
    prismaUserRepository,
  )
  return updateLeadUseCase
}
