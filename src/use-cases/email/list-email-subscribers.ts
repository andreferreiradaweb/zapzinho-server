import {
  EmailListRepository,
  EmailSubscriberRepository,
} from '@/repositories/email'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class ListEmailSubscribersUseCase {
  constructor(
    private listRepo: EmailListRepository,
    private subscriberRepo: EmailSubscriberRepository,
  ) {}

  async execute(params: {
    emailListId: string
    userId: string
    page: number
    limit: number
  }) {
    const list = await this.listRepo.findById(params.emailListId)
    if (!list) throw new ResourceNotFound()
    if (list.userId !== params.userId) throw new InvalidCredentialsError()

    const offset = (params.page - 1) * params.limit
    const [subscribers, totalItems] = await Promise.all([
      this.subscriberRepo.findAllByListId(
        params.emailListId,
        offset,
        params.limit,
      ),
      this.subscriberRepo.countByListId(params.emailListId),
    ])
    return { subscribers, totalItems }
  }
}
