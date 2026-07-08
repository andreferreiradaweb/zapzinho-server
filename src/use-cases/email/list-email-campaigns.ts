import { EmailCampaignRepository } from '@/repositories/email'

export class ListEmailCampaignsUseCase {
  constructor(private campaignRepo: EmailCampaignRepository) {}

  async execute(userId: string) {
    const campaigns = await this.campaignRepo.findAllByUserId(userId)
    return { campaigns }
  }
}
