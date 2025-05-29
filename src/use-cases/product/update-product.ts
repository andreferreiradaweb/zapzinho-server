import { Product } from '@prisma/client'
import { CompanyRepository } from '@/repositories/company'
import { ResourceNotFound } from '../../error/resource-not-found'
import { ProductRepository } from '@/repositories/product'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { InactiveUser } from '@/error/inactive-user'

interface UpdateProductUseCaseRequest {
  id?: string
  title: string
  description?: string
  code?: string
  price: string
  condition?: string
  photos: string[]
  companyId: string
  userId: string
}

interface UpdateProductUseCaseResponse {
  product: Product
}

export class UpdateProductUseCase {
  constructor(
    private productRepository: ProductRepository,
    private companyRepository: CompanyRepository,
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
    companyId,
    userId,
  }: UpdateProductUseCaseRequest): Promise<UpdateProductUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new UserNotFound()
    }

    if (!findedUser.isActive) {
      throw new InactiveUser()
    }

    const findedCompany =
      await this.companyRepository.findCompanyById(companyId)

    if (!findedCompany) {
      throw new ResourceNotFound()
    }

    if (findedCompany.userId !== userId) {
      throw new InvalidCredentialsError()
    }

    const product = await this.productRepository.update({
      id,
      title,
      description,
      code,
      price,
      condition,
      photos,
      companyId,
      createdAt: new Date(),
    })

    return { product }
  }
}
