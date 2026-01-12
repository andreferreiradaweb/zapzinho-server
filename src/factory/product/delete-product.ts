import { PrismaProductRepository } from '@/repositories/prisma/product'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { DeleteProductUseCase } from '@/use-cases/product/delete-product'

export function DeleteProductFactory() {
  const prismaProductRepository = new PrismaProductRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const deleteProductUseCase = new DeleteProductUseCase(
    prismaProductRepository,
    prismaUserRepository,
  )
  return deleteProductUseCase
}
