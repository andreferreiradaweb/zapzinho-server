import { Product } from '@prisma/client'
import { CompanyRepository } from '@/repositories/company'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { ResourceNotFound } from '../../error/resource-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'

import { ProductRepository } from '@/repositories/product'

interface DeleteProductUseCaseRequest {
  userId: string
  productId: string
}

interface DeleteProductUseCaseResponse {
  product: Product | null
}

export class DeleteProductUseCase {
  constructor(
    private productRepository: ProductRepository,
    private userRepository: UserRepository,
    private companyRepository: CompanyRepository,
  ) { }

  async execute({
    userId,
    productId,
  }: DeleteProductUseCaseRequest): Promise<DeleteProductUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)
    if (!findedUser) {
      throw new UserNotFound()
    }
    const findedCompany =
      await this.companyRepository.listCompaniesByUserId(userId)
    const findedProduct = await this.productRepository.findProductById(productId)

    if (!findedCompany || !findedProduct) {
      throw new ResourceNotFound()
    }

    if (findedCompany[0].userId !== userId) {
      throw new InvalidCredentialsError()
    }

    const product = await this.productRepository.delete(productId)

    return { product }
  }
}
