import {
  EmailListRepository,
  EmailSubscriberRepository,
} from '@/repositories/email'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class AddEmailSubscriberUseCase {
  constructor(
    private listRepo: EmailListRepository,
    private subscriberRepo: EmailSubscriberRepository,
  ) {}

  async execute(params: {
    emailListId: string
    userId: string
    email: string
    name?: string
    source?: string
  }) {
    const list = await this.listRepo.findById(params.emailListId)
    if (!list) throw new ResourceNotFound()
    if (list.userId !== params.userId) throw new InvalidCredentialsError()

    const existing = await this.subscriberRepo.findByListAndEmail(
      params.emailListId,
      params.email,
    )
    if (existing) throw new Error('E-mail já cadastrado nesta lista.')

    const subscriber = await this.subscriberRepo.create({
      emailListId: params.emailListId,
      email: params.email,
      name: params.name,
      source: params.source ?? 'manual',
    })
    return { subscriber }
  }
}
