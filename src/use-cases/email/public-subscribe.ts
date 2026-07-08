import {
  EmailListRepository,
  EmailSubscriberRepository,
} from '@/repositories/email'
import { ResourceNotFound } from '@/error/resource-not-found'

export class PublicSubscribeUseCase {
  constructor(
    private listRepo: EmailListRepository,
    private subscriberRepo: EmailSubscriberRepository,
  ) {}

  async execute(params: {
    publicToken: string
    email: string
    name?: string
  }) {
    const list = await this.listRepo.findByPublicToken(params.publicToken)
    if (!list) throw new ResourceNotFound()

    const existing = await this.subscriberRepo.findByListAndEmail(
      list.id,
      params.email,
    )
    if (existing) return { alreadySubscribed: true }

    await this.subscriberRepo.create({
      emailListId: list.id,
      email: params.email,
      name: params.name,
      source: 'api',
    })
    return { alreadySubscribed: false }
  }
}
