import { ProductRepository } from '@/repositories/product'
import { UserNotFound } from '../../error/user-not-found'
import { UserRepository } from '@/repositories/user'

interface ListProductsForOptionsUseCaseRequest {
  userId: string
}

interface ProductForOptions {
  id: string
  title: string
}

interface ListProductsUseCaseResponse {
  products: ProductForOptions[] | []
}

export class ListProductsForOptionsUseCase {
  constructor(
    private productRepository: ProductRepository,
    private userRepository: UserRepository,
  ) { }

  async execute({
    userId,
  }: ListProductsForOptionsUseCaseRequest): Promise<ListProductsUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new UserNotFound()
    }

    const products = await this.productRepository.getAllProductsForOptions(
      findedUser.id,
    )

    return {
      products
    }
  }
}
