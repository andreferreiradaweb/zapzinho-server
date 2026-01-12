import { PrismaProductRepository } from '@/repositories/prisma/product'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { UpdateProductUseCase } from '@/use-cases/product/update-product'

export function UpdateProductFactory() {
  const prismaProductRepository = new PrismaProductRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const updateProductUseCase = new UpdateProductUseCase(
    prismaProductRepository,
    prismaUserRepository,
  )
  return updateProductUseCase
}
