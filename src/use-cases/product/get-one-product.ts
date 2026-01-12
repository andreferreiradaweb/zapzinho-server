import { Product } from '@/lib/prisma'
import { ProductRepository } from '@/repositories/product'
import { UserNotFound } from '../../error/user-not-found'
import { UserRepository } from '@/repositories/user'

interface GetOneProductUseCaseRequest {
  productId: string
  userId: string
  ip: string
}

interface GetOneProductUseCaseResponse {
  product: Product
}

export class GetOneProductUseCase {
  constructor(
    private productRepository: ProductRepository,
    private userRepository: UserRepository,
  ) { }

  async execute({
    productId,
    userId,
  }: GetOneProductUseCaseRequest): Promise<GetOneProductUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new UserNotFound()
    }

    const findedProduct = await this.productRepository.findProductById(productId)

    if (!findedProduct) {
      throw new UserNotFound()
    }

    return {
      product: findedProduct,
    }
  }
}
