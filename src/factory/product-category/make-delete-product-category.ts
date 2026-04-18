import { PrismaProductCategoryRepository } from '@/repositories/prisma/product-category'
import { DeleteProductCategoryUseCase } from '@/use-cases/product-category/delete-product-category'

export function MakeDeleteProductCategory() {
  return new DeleteProductCategoryUseCase(new PrismaProductCategoryRepository())
}
