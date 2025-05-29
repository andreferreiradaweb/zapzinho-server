import { PrismaProductRepository } from '@/repositories/prisma/product'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { GetOneProductUseCase } from '@/use-cases/product/get-one-product'

export function GetOneProductFactory() {
  const prismaProductRepository = new PrismaProductRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const listProductsUseCase = new GetOneProductUseCase(
    prismaProductRepository,
    prismaUserRepository,
  )
  return listProductsUseCase
}
