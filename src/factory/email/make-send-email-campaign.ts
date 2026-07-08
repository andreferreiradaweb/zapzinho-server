import {
  PrismaEmailCampaignRepository,
  PrismaEmailSubscriberRepository,
} from '@/repositories/prisma/email'
import { SendEmailCampaignUseCase } from '@/use-cases/email/send-email-campaign'

export function makeSendEmailCampaign() {
  return new SendEmailCampaignUseCase(
    new PrismaEmailCampaignRepository(),
    new PrismaEmailSubscriberRepository(),
  )
}
