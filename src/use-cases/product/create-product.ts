import { Product } from '@/lib/prisma'
import { ProductRepository } from '@/repositories/product'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { checkInactiveLimit } from '@/helpers/checkInactiveLimit'
import { prisma } from '@/lib/prisma'

interface CreateProductUseCaseRequest {
  id?: string
  title: string
  description?: string
  code?: string
  price?: string
  condition?: string
  photos: string[]
  userId: string
  categoryId?: string
}



interface CreateProductUseCaseResponse {
  product: Product
}

export class CreateProductUseCase {
  constructor(
    private productRepository: ProductRepository,
    private userRepository: UserRepository,
  ) { }

  async execute({
    id,
    title,
    description,
    code,
    price,
    condition,
    photos,
    userId,
    categoryId,
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new UserNotFound()
    }

    await checkInactiveLimit(userId, () =>
      prisma.product.count({ where: { userId } }),
    )

    const product = await this.productRepository.create({
      id,
      title,
      description,
      code,
      price,
      condition,
      photos,
      userId,
      categoryId,
    })

    return { product }
  }
}
