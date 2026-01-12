import { Lead, Product } from '@/lib/prisma'

import { ProductRepository } from '@/repositories/product'
import { UserNotFound } from '../../error/user-not-found'
import { UserRepository } from '@/repositories/user'

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

    const totalItems = await this.productRepository.countByUserId(
      findedUser.id,
      search,
    )

    const offset = (page - 1) * limit

    const products = await this.productRepository.filterManyByUserId(
      findedUser.id,
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
