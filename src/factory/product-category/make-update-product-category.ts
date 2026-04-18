import { PrismaProductCategoryRepository } from '@/repositories/prisma/product-category'
import { UpdateProductCategoryUseCase } from '@/use-cases/product-category/update-product-category'

export function MakeUpdateProductCategory() {
  return new UpdateProductCategoryUseCase(new PrismaProductCategoryRepository())
}
