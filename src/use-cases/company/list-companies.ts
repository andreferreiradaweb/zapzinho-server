import { Company } from '@prisma/client'

import { CompanyRepository } from '@/repositories/company'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'

interface ListCompaniesUseCaseRequest {
  userId: string
}

interface ListCompaniesUseCaseResponse {
  companies: Company[] | null
}

export class ListCompaniesUseCase {
  constructor(
    private companyRepository: CompanyRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    userId,
  }: ListCompaniesUseCaseRequest): Promise<ListCompaniesUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new UserNotFound()
    }

    const companies = await this.companyRepository.listCompaniesByUserId(userId)

    return { companies }
  }
}
