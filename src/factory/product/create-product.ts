import { PrismaProductRepository } from '@/repositories/prisma/product'
import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { CreateProductUseCase } from '@/use-cases/product/create-product'

export function CreateProductFactory() {
  const prismaProductRepository = new PrismaProductRepository()
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const createProductUseCase = new CreateProductUseCase(
    prismaProductRepository,
    prismaCompanyRepository,
    prismaUserRepository,
  )
  return createProductUseCase
}
