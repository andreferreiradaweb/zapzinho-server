import { Lead, Product } from '@prisma/client'

import { ProductRepository } from '@/repositories/product'
import { CompanyRepository } from '@/repositories/company'
import { ResourceNotFound } from '../../error/resource-not-found'
import { UserNotFound } from '../../error/user-not-found'
import { UserRepository } from '@/repositories/user'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'

interface ListProductsUseCaseRequest {
  userId: string
  page?: number
  limit?: number
  search?: string
}

interface ProductWithLeads extends Product {
  Leads: Lead[]
}

interface ListProductsUseCaseResponse {
  totalItems: number
  currentPage: number
  itemsPerPage: number
  products: ProductWithLeads[] | []
}

export class ListProductsUseCase {
  constructor(
    private productRepository: ProductRepository,
    private companyRepository: CompanyRepository,
    private userRepository: UserRepository,
  ) { }

  async execute({
    userId,
    page = 1,
    limit = 10,
    search = '',
  }: ListProductsUseCaseRequest): Promise<ListProductsUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new UserNotFound()
    }

    const findedCompany =
      await this.companyRepository.listCompaniesByUserId(userId)

    if (!findedCompany) {
      throw new ResourceNotFound()
    }

    if (findedCompany[0].userId !== userId) {
      throw new InvalidCredentialsError()
    }

    const totalItems = await this.productRepository.countByCompanyId(
      findedCompany[0].id,
      search,
    )

    const offset = (page - 1) * limit

    const products = await this.productRepository.filterManyByCompanyId(
      findedCompany[0].id,
      offset,
      limit,
      search,
    )

    return {
      totalItems,
      currentPage: page,
      itemsPerPage: limit,
      products,
    }
  }
}
