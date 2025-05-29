import { Prisma, User } from '@prisma/client'
import { CompanyRepository } from '@/repositories/company'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { ResourceNotFound } from '../../error/resource-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'

import { RecordsFoundError } from '@/error/records-found-error'
import { LeadRepository } from '@/repositories/lead'
import { TransactionProvider } from '@/helpers/transaction-provider'
import { ProductRepository } from '@/repositories/product'

interface DeleteUserUseCaseRequest {
  userId: string
}

interface DeleteUserUseCaseResponse {
  user: User | null
}

export class DeleteUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private companyRepository: CompanyRepository,
    private productRepository: ProductRepository,
    private leadRepository: LeadRepository,
    private transactionProvider: TransactionProvider,
  ) { }

  async execute({
    userId,
  }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)
    if (!findedUser) {
      throw new UserNotFound()
    }

    const findedCompany = await this.companyRepository.listCompaniesByUserId(
      findedUser.id,
    )

    if (!findedCompany) {
      throw new ResourceNotFound()
    }

    if (findedCompany[0].userId !== findedUser.id) {
      throw new InvalidCredentialsError()
    }

    const products = await this.productRepository.findManyByCompanyId(
      findedCompany[0].id,
    )

    if (products.length > 0) {
      throw new RecordsFoundError()
    }

    const leads = await this.leadRepository.findManyByCompanyId(
      findedCompany[0].id,
    )



    await this.transactionProvider.runTransaction(async () => {
      if (leads.length > 0) {
        for (const lead of leads) {
          await this.leadRepository.delete(lead.id)
        }
      }
      for (const company of findedCompany) {
        await this.companyRepository.delete(company.id)
      }
      await this.userRepository.delete(findedUser.id)
    }, Prisma.TransactionIsolationLevel.Serializable)

    return { user: findedUser }
  }
}
