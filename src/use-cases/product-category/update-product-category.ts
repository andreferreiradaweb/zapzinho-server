import { ProductCategory } from '@/lib/prisma'
import { ProductCategoryRepository } from '@/repositories/product-category'
import { ResourceNotFound } from '@/error/resource-not-found'

interface Request {
  id: string
  name: string
  userId: string
}

interface Response {
  category: ProductCategory
}

export class UpdateProductCategoryUseCase {
  constructor(private categoryRepository: ProductCategoryRepository) {}

  async execute({ id, name, userId }: Request): Promise<Response> {
    const existing = await this.categoryRepository.findById(id)
    if (!existing || existing.userId !== userId) throw new ResourceNotFound()

    const category = await this.categoryRepository.update({ id, name })
    return { category }
  }
}
