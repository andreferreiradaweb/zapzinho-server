import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { DeleteLeadUseCase } from '@/use-cases/lead/delete-lead'

export function DeleteLeadFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const deleteLeadUseCase = new DeleteLeadUseCase(
    prismaLeadRepository,
    prismaUserRepository
  )
  return deleteLeadUseCase
}
