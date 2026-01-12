import { PrismaProductRepository } from '@/repositories/prisma/product'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { CreateLeadUseCase } from '@/use-cases/lead/create-lead'
import { PrismaUserRepository } from '@/repositories/prisma/user'

export function CreateLeadFactory() {
  const prismaLeadRepository = new PrismaLeadRepository()
  const prismaProductRepository = new PrismaProductRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const createLeadUseCase = new CreateLeadUseCase(
    prismaLeadRepository,
    prismaProductRepository,
    prismaUserRepository
  )
  return createLeadUseCase
}
