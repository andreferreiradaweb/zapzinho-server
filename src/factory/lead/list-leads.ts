import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { ListLeadsUseCase } from '@/use-cases/lead/list-leads'

export function ListLeadsFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const createLeadUseCase = new ListLeadsUseCase(
    prismaLeadRepository,
    prismaUserRepository,
  )
  return createLeadUseCase
}
