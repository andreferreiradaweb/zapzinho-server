import { PrismaProductRepository } from '@/repositories/prisma/product'
import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { DeleteProductUseCase } from '@/use-cases/product/delete-product'

export function DeleteProductFactory() {
  const prismaProductRepository = new PrismaProductRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const deleteProductUseCase = new DeleteProductUseCase(
    prismaProductRepository,
    prismaUserRepository,
    prismaCompanyRepository,
  )
  return deleteProductUseCase
}
