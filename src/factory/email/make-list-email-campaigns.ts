import { PrismaEmailCampaignRepository } from '@/repositories/prisma/email'
import { ListEmailCampaignsUseCase } from '@/use-cases/email/list-email-campaigns'

export function makeListEmailCampaigns() {
  return new ListEmailCampaignsUseCase(new PrismaEmailCampaignRepository())
}
