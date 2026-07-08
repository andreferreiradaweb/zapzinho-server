import { EmailSubscriberRepository } from '@/repositories/email'
import { ResourceNotFound } from '@/error/resource-not-found'

export class RemoveEmailSubscriberUseCase {
  constructor(private subscriberRepo: EmailSubscriberRepository) {}

  async execute(subscriberId: string) {
    const sub = await this.subscriberRepo.findById(subscriberId)
    if (!sub) throw new ResourceNotFound()
    await this.subscriberRepo.delete(subscriberId)
  }
}
