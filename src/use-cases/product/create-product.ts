import { Product } from '@prisma/client'
import { CompanyRepository } from '@/repositories/company'
import { ResourceNotFound } from '../../error/resource-not-found'
import { ProductRepository } from '@/repositories/product'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { MaxRegistrationLimitReached } from '@/error/max-registration'
import { getHouseRegisterLimitByPlan } from '@/helpers/getCarRegistrationLimit'
import { InactiveUser } from '@/error/inactive-user'

interface CreateProductUseCaseRequest {
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



interface CreateProductUseCaseResponse {
  product: Product
}

export class CreateProductUseCase {
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
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
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

    const products = await this.productRepository.findManyByCompanyId(companyId)

    if (products.length === getHouseRegisterLimitByPlan(findedUser.Plan)) {
      throw new MaxRegistrationLimitReached()
    }

    const product = await this.productRepository.create({
      id,
      title,
      description,
      code,
      price,
      condition,
      photos,
      companyId,
    })

    return { product }
  }
}
