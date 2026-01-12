import { Product } from '@/lib/prisma'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { ResourceNotFound } from '../../error/resource-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'

import { ProductRepository } from '@/repositories/product'
import { InactiveUser } from '@/error/inactive-user'

interface DeleteProductUseCaseRequest {
  id: string
  userId: string
}

interface DeleteProductUseCaseResponse {
  product: Product | null
}

export class DeleteProductUseCase {
  constructor(
    private productRepository: ProductRepository,
    private userRepository: UserRepository,
  ) { }

  async execute({
    id,
    userId,
  }: DeleteProductUseCaseRequest): Promise<DeleteProductUseCaseResponse> {
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

    const product = await this.productRepository.delete(id)

    return { product }
  }
}
