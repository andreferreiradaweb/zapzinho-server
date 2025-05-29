import { Lead, LeadStatus } from '@prisma/client'

import { CompanyRepository } from '@/repositories/company'
import { ResourceNotFound } from '../../error/resource-not-found'
import { UserNotFound } from '../../error/user-not-found'
import { UserRepository } from '@/repositories/user'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { LeadRepository } from '@/repositories/lead'

interface ListLeadsUseCaseRequest {
  userId: string
  page?: number
  limit?: number
  search?: string
  status?: LeadStatus
  startDate?: string
  endDate?: string
}

type House = {
  id: string
  title: string
  address: string
  city: string
  photos: string[]
}

export interface LeadWithHouse extends Lead {
  House: House
}

interface ListLeadsUseCaseResponse {
  totalItems: number
  currentPage: number
  itemsPerPage: number
  leads: LeadWithHouse[] | []
}

export class ListLeadsUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private companyRepository: CompanyRepository,
    private userRepository: UserRepository,
  ) { }

  async execute({
    userId,
    page = 1,
    limit = 10,
    search = '',
    status,
    startDate,
    endDate,
  }: ListLeadsUseCaseRequest): Promise<ListLeadsUseCaseResponse> {
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

    const totalItems = await this.leadRepository.countByCompanyId(
      findedCompany[0].id,
      search,
      status,
      startDate,
      endDate,
    )

    const offset = (page - 1) * limit

    const leads = await this.leadRepository.filterManyByCompanyId(
      findedCompany[0].id,
      offset,
      limit,
      search,
      status,
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
