import { PrismaProductRepository } from '@/repositories/prisma/product'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { CreateProductUseCase } from '@/use-cases/product/create-product'

export function CreateProductFactory() {
  const prismaProductRepository = new PrismaProductRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const createProductUseCase = new CreateProductUseCase(
    prismaProductRepository,
    prismaUserRepository,
  )
  return createProductUseCase
}
