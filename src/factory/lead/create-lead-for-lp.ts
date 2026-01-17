import { PrismaProductRepository } from '@/repositories/prisma/product'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { CreateLeadForLpUseCase } from '@/use-cases/lead/create-lead-for-lp'
import { PrismaUserRepository } from '@/repositories/prisma/user'

export function CreateLeadForLpFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaProductRepository = new PrismaProductRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const createLeadUseCase = new CreateLeadForLpUseCase(
    prismaLeadRepository,
    prismaProductRepository,
    prismaUserRepository
  )
  return createLeadUseCase
}
