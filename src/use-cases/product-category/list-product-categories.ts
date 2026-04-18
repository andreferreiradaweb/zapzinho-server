import { ProductCategory } from '@/lib/prisma'
import { ProductCategoryRepository } from '@/repositories/product-category'

interface Request {
  userId: string
}

interface Response {
  categories: ProductCategory[]
}

export class ListProductCategoriesUseCase {
  constructor(private categoryRepository: ProductCategoryRepository) {}

  async execute({ userId }: Request): Promise<Response> {
    const categories = await this.categoryRepository.listByUserId(userId)
    return { categories }
  }
}
