import { PrismaProductCategoryRepository } from '@/repositories/prisma/product-category'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { CreateProductCategoryUseCase } from '@/use-cases/product-category/create-product-category'

export function MakeCreateProductCategory() {
  return new CreateProductCategoryUseCase(
    new PrismaProductCategoryRepository(),
    new PrismaUserRepository(),
  )
}
