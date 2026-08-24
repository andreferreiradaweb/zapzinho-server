import { MessageLogRepository } from '@/repositories/message-log'
import { generateRagReply } from '@/services/rag'
import {
  sendWhatsAppMessage,
  sendWhatsAppImage,
  sendWhatsAppVideo,
  sendWhatsAppAudio,
} from '@/services/wapi'
import { v4 as uuid } from 'uuid'

interface SendRagReplyRequest {
  userId: string
  leadId: string
  phone: string
  message: string
}

type SendResult = { success: boolean; error?: string }

export class SendRagReplyUseCase {
  constructor(private logRepo: MessageLogRepository) {}

  async execute({ userId, leadId, phone, message }: SendRagReplyRequest): Promise<void> {
    const result = await generateRagReply({ userId, message })
    if (!result) return

    await this.logAndSend(userId, leadId, phone, result.text, () =>
      sendWhatsAppMessage({ phone, message: result.text }),
    )

    if (result.media) {
      const media = result.media
      await this.logAndSend(userId, leadId, phone, `[${media.type}] ${media.title}`, () => {
        if (media.type === 'IMAGE') return sendWhatsAppImage({ phone, imageUrl: media.url })
        if (media.type === 'VIDEO') return sendWhatsAppVideo({ phone, videoUrl: media.url })
        return sendWhatsAppAudio({ phone, audioUrl: media.url })
      })
    }
  }

  private async logAndSend(
    userId: string,
    leadId: string,
    phone: string,
    message: string,
    send: () => Promise<SendResult>,
  ): Promise<void> {
    const logId = uuid()
    await this.logRepo.create({
      id: logId,
      userId,
      leadId,
      phone,
      message,
      type: 'RAG_REPLY',
      status: 'PENDING',
    })

    const result = await send()
    if (result.success) {
      await this.logRepo.markSent(logId)
    } else {
      await this.logRepo.markFailed(logId, result.error ?? 'unknown error')
    }
  }
}
