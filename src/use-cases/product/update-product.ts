import { Product } from '@/lib/prisma'
import { ResourceNotFound } from '../../error/resource-not-found'
import { ProductRepository } from '@/repositories/product'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { InactiveUser } from '@/error/inactive-user'

interface UpdateProductUseCaseRequest {
  id: string
  title: string
  description?: string
  code?: string
  price?: string
  costPrice?: string
  condition?: string
  photos: string[]
  userId: string
  categoryId?: string
}

interface UpdateProductUseCaseResponse {
  product: Product
}

export class UpdateProductUseCase {
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
    costPrice,
    condition,
    photos,
    userId,
    categoryId,
  }: UpdateProductUseCaseRequest): Promise<UpdateProductUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new UserNotFound()
    }

    if (!findedUser.isActive) {
      throw new InactiveUser()
    }

    const findedProduct = await this.productRepository.findProductById(id)

    if (!findedProduct) {
      throw new ResourceNotFound()
    }
    
    if (findedProduct.userId !== userId) {
      throw new InvalidCredentialsError()
    }

    const product = await this.productRepository.update({
      id,
      title,
      description,
      code,
      price,
      costPrice,
      condition,
      photos,
      userId,
      categoryId,
      createdAt: new Date(),
    })

    return { product }
  }
}
