import { PrismaProductRepository } from '@/repositories/prisma/product'
import { ListProductsForOptionsUseCase } from '@/use-cases/product/list-products-for-options'
import { PrismaUserRepository } from '@/repositories/prisma/user'

export function ListProductsForOptionsFactory() {
  const prismaProductRepository = new PrismaProductRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const listProductsForOptionsUseCase = new ListProductsForOptionsUseCase(
    prismaProductRepository,
    prismaUserRepository,
  )
  return listProductsForOptionsUseCase
}
