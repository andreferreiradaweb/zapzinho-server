import { Company } from '@prisma/client'

import { CompanyRepository } from '@/repositories/company'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { ResourceNotFound } from '../../error/resource-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'

interface GetOneCompanyUseCaseRequest {
  userId: string
  companyId: string
}

interface GetOneCompanyUseCaseResponse {
  company: Company | null
}

export class GetOneCompanyUseCase {
  constructor(
    private companyRepository: CompanyRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    userId,
    companyId,
  }: GetOneCompanyUseCaseRequest): Promise<GetOneCompanyUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new UserNotFound()
    }

    const findedCompany =
      await this.companyRepository.findCompanyById(companyId)

    if (!findedCompany) {
      throw new ResourceNotFound()
    }

    if (findedCompany.userId !== userId) {
      throw new InvalidCredentialsError()
    }

    return { company: findedCompany }
  }
}
