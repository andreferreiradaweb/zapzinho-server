import { Prisma, Role, User } from '@/lib/prisma'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { LeadRepository } from '@/repositories/lead'
import { TransactionProvider } from '@/helpers/transaction-provider'
import { ProductRepository } from '@/repositories/product'
import { prisma } from '@/lib/prisma'
import { deleteManyFromCloudinary } from '@/services/cloudinary'

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

    if (findedUser.Role === Role.ADMIN) {
      throw new InvalidCredentialsError()
    }

    const [templates, broadcasts, automations] = await Promise.all([
      prisma.messageTemplate.findMany({ where: { userId }, select: { imageUrl: true, videoUrl: true } }),
      prisma.broadcast.findMany({ where: { userId }, select: { imageUrls: true, videoUrl: true } }),
      prisma.automation.findMany({ where: { userId }, select: { imageUrls: true, videoUrl: true } }),
    ])

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

    const mediaUrls: string[] = [
      ...findedUser.Products.flatMap((p) => p.photos),
      ...templates.flatMap((t) => [t.imageUrl, t.videoUrl].filter(Boolean) as string[]),
      ...broadcasts.flatMap((b) => [...b.imageUrls, b.videoUrl].filter(Boolean) as string[]),
      ...automations.flatMap((a) => [...a.imageUrls, a.videoUrl].filter(Boolean) as string[]),
    ]
    if (mediaUrls.length > 0) await deleteManyFromCloudinary(mediaUrls)

    return { user: findedUser }
  }
}
