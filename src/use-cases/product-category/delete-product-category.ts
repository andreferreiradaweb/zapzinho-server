import { ProductCategoryRepository } from '@/repositories/product-category'
import { ResourceNotFound } from '@/error/resource-not-found'

interface Request {
  id: string
  userId: string
}

export class DeleteProductCategoryUseCase {
  constructor(private categoryRepository: ProductCategoryRepository) {}

  async execute({ id, userId }: Request): Promise<void> {
    const existing = await this.categoryRepository.findById(id)
    if (!existing || existing.userId !== userId) throw new ResourceNotFound()

    await this.categoryRepository.delete(id)
  }
}
