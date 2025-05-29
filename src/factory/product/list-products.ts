import { PrismaCompanyRepository } from '@/repositories/prisma/company'
import { PrismaProductRepository } from '@/repositories/prisma/product'
import { ListProductsUseCase } from '@/use-cases/product/list-products'
import { PrismaUserRepository } from '@/repositories/prisma/user'

export function ListProductsFactory() {
  const prismaProductRepository = new PrismaProductRepository()
  const prismaCompanyRepository = new PrismaCompanyRepository()
  const prismaUserRepository = new PrismaUserRepository()
  const listProductsUseCase = new ListProductsUseCase(
    prismaProductRepository,
    prismaCompanyRepository,
    prismaUserRepository,
  )
  return listProductsUseCase
}
