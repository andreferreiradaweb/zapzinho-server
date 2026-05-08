import { Role, User } from '@/lib/prisma'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { prisma } from '@/lib/prisma'
import { deleteManyFromCloudinary } from '@/services/cloudinary'

interface DeleteUserUseCaseRequest {
  userId: string
}

interface DeleteUserUseCaseResponse {
  user: User | null
}

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ userId }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    const foundUser = await this.userRepository.findUserById(userId)
    if (!foundUser) throw new UserNotFound()
    if (foundUser.Role === Role.ADMIN) throw new InvalidCredentialsError()

    const [templates, broadcasts, automations] = await Promise.all([
      prisma.messageTemplate.findMany({ where: { userId }, select: { imageUrl: true, videoUrl: true } }),
      prisma.broadcast.findMany({ where: { userId }, select: { id: true, imageUrls: true, videoUrl: true } }),
      prisma.automation.findMany({ where: { userId }, select: { imageUrls: true, videoUrl: true } }),
    ])

    const broadcastIds = broadcasts.map((b) => b.id)

    await prisma.$transaction(async (tx) => {
      await tx.serpSearchOffset.deleteMany({ where: { userId } })
      await tx.serpSearchLog.deleteMany({ where: { userId } })
      await tx.flowSession.deleteMany({ where: { userId } })
      await tx.messageLog.deleteMany({ where: { userId } })
      await tx.broadcastLead.deleteMany({ where: { broadcastId: { in: broadcastIds } } })
      await tx.leadSale.deleteMany({ where: { userId } })
      await tx.lead.deleteMany({ where: { userId } })
      await tx.prospectingBroadcast.deleteMany({ where: { userId } })
      await tx.contactList.deleteMany({ where: { userId } })
      await tx.flow.deleteMany({ where: { userId } })
      await tx.broadcast.deleteMany({ where: { userId } })
      await tx.broadcastBlock.deleteMany({ where: { userId } })
      await tx.automation.deleteMany({ where: { userId } })
      await tx.messageTemplate.deleteMany({ where: { userId } })
      await tx.product.deleteMany({ where: { userId } })
      await tx.productCategory.deleteMany({ where: { userId } })
      await tx.user.delete({ where: { id: userId } })
    })

    const mediaUrls: string[] = [
      ...foundUser.Products.flatMap((p) => p.photos),
      ...templates.flatMap((t) => [t.imageUrl, t.videoUrl].filter(Boolean) as string[]),
      ...broadcasts.flatMap((b) => [...b.imageUrls, b.videoUrl].filter(Boolean) as string[]),
      ...automations.flatMap((a) => [...a.imageUrls, a.videoUrl].filter(Boolean) as string[]),
    ]
    if (mediaUrls.length > 0) await deleteManyFromCloudinary(mediaUrls)

    return { user: foundUser }
  }
}
