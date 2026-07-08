import {
  EmailCampaignRepository,
  EmailSubscriberRepository,
} from '@/repositories/email'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { sendEmail } from '@/services/resend'

export class SendEmailCampaignUseCase {
  constructor(
    private campaignRepo: EmailCampaignRepository,
    private subscriberRepo: EmailSubscriberRepository,
  ) {}

  async execute(campaignId: string, userId: string) {
    const campaign = await this.campaignRepo.findById(campaignId)
    if (!campaign) throw new ResourceNotFound()
    if (campaign.userId !== userId) throw new InvalidCredentialsError()
    if (campaign.status === 'SENDING') return

    await this.campaignRepo.updateStatus(campaignId, 'SENDING', {
      startedAt: new Date(),
    })

    this.runSend(campaign).catch((err) => {
      console.error('[EmailCampaign] Fatal error:', err)
      this.campaignRepo.updateStatus(campaignId, 'FAILED').catch(() => null)
    })
  }

  private async runSend(
    campaign: Awaited<ReturnType<EmailCampaignRepository['findById']>>,
  ) {
    if (!campaign) return

    const subscribers = await this.subscriberRepo.findSubscribedByListId(
      campaign.emailListId,
    )

    console.log(
      `[EmailCampaign] Iniciando id=${campaign.id} | destinatários=${subscribers.length}`,
    )

    for (const sub of subscribers) {
      const result = await sendEmail({
        to: sub.email,
        subject: campaign.subject,
        html: campaign.body,
      })

      if (result.success) {
        await this.campaignRepo.incrementCount(campaign.id, 'totalSent')
        console.log(`[EmailCampaign] ✓ Enviado para ${sub.email}`)
      } else {
        await this.campaignRepo.incrementCount(campaign.id, 'totalFailed')
        console.error(
          `[EmailCampaign] ✗ Falha para ${sub.email}: ${result.error}`,
        )
      }
    }

    await this.campaignRepo.updateStatus(campaign.id, 'SENT', {
      finishedAt: new Date(),
    })
    console.log(`[EmailCampaign] Concluído id=${campaign.id}`)
  }
}
