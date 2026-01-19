import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { CreateLeadForAutomationUseCase } from '@/use-cases/lead/create-lead-for-automation'

export function CreateLeadForAutomationFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const createLeadUseCase = new CreateLeadForAutomationUseCase(
    prismaLeadRepository,
    prismaUserRepository
  )
  return createLeadUseCase
}
