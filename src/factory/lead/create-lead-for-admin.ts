import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { CreateLeadForAdminUseCase } from '@/use-cases/lead/create-lead-for-admin'

export function CreateLeadForAdminFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const createLeadUseCase = new CreateLeadForAdminUseCase(
    prismaLeadRepository,
    prismaUserRepository,
  )
  return createLeadUseCase
}
