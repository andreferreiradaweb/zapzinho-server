import { PrismaProductRepository } from '@/repositories/prisma/product'
import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { UpdateProductUseCase } from '@/use-cases/product/update-product'

export function UpdateProductFactory() {
  const prismaProductRepository = new PrismaProductRepository()
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const updateProductUseCase = new UpdateProductUseCase(
    prismaProductRepository,
    prismaCompanyRepository,
    prismaUserRepository,
  )
  return updateProductUseCase
}
