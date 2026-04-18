import { ProductCategory } from '@/lib/prisma'
import { ProductCategoryRepository } from '@/repositories/product-category'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '@/error/user-not-found'
import { v4 as uuid } from 'uuid'

interface Request {
  name: string
  userId: string
}

interface Response {
  category: ProductCategory
}

export class CreateProductCategoryUseCase {
  constructor(
    private categoryRepository: ProductCategoryRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({ name, userId }: Request): Promise<Response> {
    const user = await this.userRepository.findUserById(userId)
    if (!user) throw new UserNotFound()

    const category = await this.categoryRepository.create({ id: uuid(), name, userId })
    return { category }
  }
}
