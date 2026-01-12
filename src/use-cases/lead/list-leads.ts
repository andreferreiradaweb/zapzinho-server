import { Lead, LeadOption, LeadStatus, Product } from '@/lib/prisma'
import { UserNotFound } from '../../error/user-not-found'
import { UserRepository } from '@/repositories/user'
import { LeadRepository } from '@/repositories/lead'

interface ListLeadsUseCaseRequest {
  userId: string
  page?: number
  limit?: number
  search?: string
  status?: LeadStatus
  option?: LeadOption
  startDate?: string
  endDate?: string
}

interface ListLeadsUseCaseResponse {
  totalItems: number
  currentPage: number
  itemsPerPage: number
  leads: Lead[] | []
}

export class ListLeadsUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private userRepository: UserRepository,
  ) { }

  async execute({
    userId,
    page = 1,
    limit = 10,
    search = '',
    status,
    option,
    startDate,
    endDate,
  }: ListLeadsUseCaseRequest): Promise<ListLeadsUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new UserNotFound()
    }

    const totalItems = await this.leadRepository.countByUserId(
      findedUser.id,
      search,
      status,
      option,
      startDate,
      endDate,
    )

    const offset = (page - 1) * limit

    const leads = await this.leadRepository.filterManyByUserId(
      findedUser.id,
      offset,
      limit,
      search,
      status,
      option,
      startDate,
      endDate,
    )

    return {
      totalItems,
      currentPage: page,
      itemsPerPage: limit,
      leads,
    }
  }
}
