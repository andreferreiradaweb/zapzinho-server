import { BroadcastRepository } from '@/repositories/broadcast'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { deleteManyFromCloudinary } from '@/services/cloudinary'

export class DeleteBroadcastUseCase {
  constructor(private broadcastRepository: BroadcastRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const broadcast = await this.broadcastRepository.findById(id)
    if (!broadcast) throw new ResourceNotFound()
    if (broadcast.userId !== userId) throw new InvalidCredentialsError()
    await this.broadcastRepository.delete(id)

    const mediaUrls = [...broadcast.imageUrls, broadcast.videoUrl].filter(Boolean) as string[]
    if (mediaUrls.length > 0) await deleteManyFromCloudinary(mediaUrls)
  }
}
