import {
  EmailListRepository,
  EmailCampaignRepository,
} from '@/repositories/email'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class CreateEmailCampaignUseCase {
  constructor(
    private listRepo: EmailListRepository,
    private campaignRepo: EmailCampaignRepository,
  ) {}

  async execute(params: {
    userId: string
    emailListId: string
    name: string
    subject: string
    body: string
  }) {
    const list = await this.listRepo.findById(params.emailListId)
    if (!list) throw new ResourceNotFound()
    if (list.userId !== params.userId) throw new InvalidCredentialsError()

    const campaign = await this.campaignRepo.create(params)
    return { campaign }
  }
}
