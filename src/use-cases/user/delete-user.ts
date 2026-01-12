import { Prisma, Role, User } from '@/lib/prisma'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'

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

    if (findedUser.Role !== Role.ADMIN) {
      throw new InvalidCredentialsError()
    }

    await this.transactionProvider.runTransaction(async () => {
      if (findedUser.Leads.length > 0) {
        for (const lead of findedUser.Leads) {
          await this.leadRepository.delete(lead.id)
        }
      }
      if (findedUser.Products.length > 0) {
        for (const product of findedUser.Products) {
          await this.productRepository.delete(product.id)
        }
      }
      await this.userRepository.delete(findedUser.id)
    }, Prisma.TransactionIsolationLevel.Serializable)

    return { user: findedUser }
  }
}
