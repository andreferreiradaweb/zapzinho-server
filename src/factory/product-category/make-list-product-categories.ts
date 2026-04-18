import { PrismaProductCategoryRepository } from '@/repositories/prisma/product-category'
import { ListProductCategoriesUseCase } from '@/use-cases/product-category/list-product-categories'

export function MakeListProductCategories() {
  return new ListProductCategoriesUseCase(new PrismaProductCategoryRepository())
}
