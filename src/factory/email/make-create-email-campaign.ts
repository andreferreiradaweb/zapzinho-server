import {
  PrismaEmailListRepository,
  PrismaEmailCampaignRepository,
} from '@/repositories/prisma/email'
import { CreateEmailCampaignUseCase } from '@/use-cases/email/create-email-campaign'

export function makeCreateEmailCampaign() {
  return new CreateEmailCampaignUseCase(
    new PrismaEmailListRepository(),
    new PrismaEmailCampaignRepository(),
  )
}
