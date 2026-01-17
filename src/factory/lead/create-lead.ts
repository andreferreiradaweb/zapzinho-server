import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { CreateLeadUseCase } from '@/use-cases/lead/create-lead'

export function CreateLeadFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const createLeadUseCase = new CreateLeadUseCase(
    prismaLeadRepository,
    prismaUserRepository,
  )
  return createLeadUseCase
}
