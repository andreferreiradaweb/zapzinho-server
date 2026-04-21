import { AutomationRepository } from '@/repositories/automation'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { deleteManyFromCloudinary } from '@/services/cloudinary'

export class DeleteAutomationUseCase {
  constructor(private automationRepository: AutomationRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const automation = await this.automationRepository.findById(id)
    if (!automation) throw new ResourceNotFound()
    if (automation.userId !== userId) throw new InvalidCredentialsError()
    await this.automationRepository.delete(id)

    const mediaUrls = [...automation.imageUrls, automation.videoUrl].filter(Boolean) as string[]
    if (mediaUrls.length > 0) await deleteManyFromCloudinary(mediaUrls)
  }
}
