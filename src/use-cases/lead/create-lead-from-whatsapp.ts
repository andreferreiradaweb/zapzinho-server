import { Lead } from '@/lib/prisma'
import { LeadRepository } from '@/repositories/lead'
import { MessageLogRepository } from '@/repositories/message-log'
import { UserRepository } from '@/repositories/user'
import { ResourceNotFound } from '@/error/resource-not-found'
import { sendWhatsAppMessageWithCredentials } from '@/services/wapi'

interface Request {
  storePhone: string
  telefone?: string
  nome?: string
  origin?: string
  message?: string
}

interface Response {
  lead?: Lead
  created: boolean
  messageSent: boolean
}

export class CreateLeadFromWhatsappUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private userRepository: UserRepository,
    private messageLogRepository: MessageLogRepository,
  ) {}

  async execute({ storePhone, telefone, nome, origin, message }: Request): Promise<Response> {
    const user = await this.userRepository.findUserByPhone(storePhone)
    if (!user) throw new ResourceNotFound()

    let messageSent = false

    if (message && user.wapiInstanceId && user.wapiToken) {
      const fullMessage =
        telefone && nome
          ? `${message}\n\nNome: ${nome}\nWhatsApp: ${telefone}`
          : message

      try {
        await sendWhatsAppMessageWithCredentials(
          user.wapiInstanceId,
          user.wapiToken,
          storePhone,
          fullMessage,
        )
        await this.messageLogRepository.create({
          userId: user.id,
          phone: storePhone,
          message: fullMessage,
          type: 'LEAD_NOTIFICATION',
          status: 'SENT',
        })
        messageSent = true
      } catch (err) {
        console.error('[LeadFromWhatsapp] Falha ao enviar notificação:', err)
      }
    }

    if (!telefone || !nome) {
      return { created: false, messageSent }
    }

    const phone = telefone.replace(/\D/g, '')

    const { lead, created } = await this.leadRepository.upsertByPhone({
      userId: user.id,
      phone,
      name: nome,
      message: 'Lead capturado via landing page',
      origin,
    })

    return { lead, created, messageSent }
  }
}
