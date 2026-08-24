import { MediaAssetRepository } from '@/repositories/media-asset'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { deleteFromCloudinary } from '@/services/cloudinary'

export class DeleteMediaAssetUseCase {
  constructor(private repo: MediaAssetRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const media = await this.repo.findById(id)
    if (!media) throw new ResourceNotFound()
    if (media.userId !== userId) throw new InvalidCredentialsError()
    await this.repo.delete(id)
    await deleteFromCloudinary(media.url)
  }
}
