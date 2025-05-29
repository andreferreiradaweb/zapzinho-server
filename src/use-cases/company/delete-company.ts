import { Company } from '@prisma/client'
import { CompanyRepository } from '@/repositories/company'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { ResourceNotFound } from '../../error/resource-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { RecordsFoundError } from '../../error/records-found-error'
import { HouseRepository } from '@/repositories/product'

interface DeleteCompanyUseCaseRequest {
  userId: string
  companyId: string
}

interface DeleteCompanyUseCaseResponse {
  company: Company | null
}

export class DeleteCompanyUseCase {
  constructor(
    private companyRepository: CompanyRepository,
    private userRepository: UserRepository,
    private houseRepository: HouseRepository,
  ) { }

  async execute({
    userId,
    companyId,
  }: DeleteCompanyUseCaseRequest): Promise<DeleteCompanyUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)
    if (!findedUser) {
      throw new UserNotFound()
    }
    const findedCompany =
      await this.companyRepository.findCompanyById(companyId)
    if (!findedCompany) {
      throw new ResourceNotFound()
    }

    const houses = await this.houseRepository.findManyByCompanyId(companyId)
    if (Array.isArray(houses) && houses.length > 0) {
      throw new RecordsFoundError()
    }

    if (findedCompany.userId !== userId) {
      throw new InvalidCredentialsError()
    }
    const deletedCompany = await this.companyRepository.delete(companyId)

    return { company: deletedCompany }
  }
}
