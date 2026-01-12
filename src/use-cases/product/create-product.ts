import { Product } from '@/lib/prisma'
import { ProductRepository } from '@/repositories/product'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { InactiveUser } from '@/error/inactive-user'

interface CreateProductUseCaseRequest {
  id?: string
  title: string
  description?: string
  code?: string
  price: string
  condition?: string
  photos: string[]
  userId: string
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
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new UserNotFound()
    }

    if (!findedUser.isActive) {
      throw new InactiveUser()
    }

    const product = await this.productRepository.create({
      id,
      title,
      description,
      code,
      price,
      condition,
      photos,
      userId,
    })

    return { product }
  }
}
