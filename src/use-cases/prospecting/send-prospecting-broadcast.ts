import {
  ContactListRepository,
  ProspectingBroadcastRepository,
} from '@/repositories/prospecting'
import { MessageLogRepository } from '@/repositories/message-log'
import { UserRepository } from '@/repositories/user'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { sendWhatsAppMessageWithCredentials, wapiProspectingDelay } from '@/services/wapi'
import { v4 as uuid } from 'uuid'

export class SendProspectingBroadcastUseCase {
  constructor(
    private contactListRepository: ContactListRepository,
    private prospectingBroadcastRepository: ProspectingBroadcastRepository,
    private messageLogRepository: MessageLogRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(broadcastId: string, userId: string): Promise<void> {
    const broadcast = await this.prospectingBroadcastRepository.findById(broadcastId)
    if (!broadcast) throw new ResourceNotFound()
    if (broadcast.userId !== userId) throw new InvalidCredentialsError()

    if (broadcast.status === 'SENDING' || broadcast.status === 'SENT') return

    const user = await this.userRepository.findUserById(userId)
    if (!user || !user.prospectingInstanceId || !user.prospectingToken) {
      throw new Error('Credenciais de prospecção não configuradas para este usuário')
    }

    await this.prospectingBroadcastRepository.updateStatus(broadcastId, 'SENDING', {
      startedAt: new Date(),
    })

    this.runSend(broadcast, userId, user.prospectingInstanceId, user.prospectingToken).catch((err) => {
      console.error('[ProspectingBroadcast] Fatal error:', err)
      this.prospectingBroadcastRepository.updateStatus(broadcastId, 'FAILED').catch(() => null)
    })
  }

  private async runSend(
    broadcast: Awaited<ReturnType<ProspectingBroadcastRepository['findById']>>,
    userId: string,
    instanceId: string,
    token: string,
  ) {
    if (!broadcast) return

    const allowedCategories = broadcast.categoryFilter
      ? broadcast.categoryFilter.split(',').map((s) => s.trim())
      : null

    const allEligible = broadcast.ContactList.Contacts.filter(
      (c) => !allowedCategories || (c.category !== null && allowedCategories.includes(c.category)),
    )

    const contacts = allEligible.filter(
      (c) => c.status === 'PENDING' || c.status === 'FAILED',
    )

    const alreadyReceived = allEligible.filter(
      (c) => !['PENDING', 'FAILED'].includes(c.status),
    )

    if (alreadyReceived.length > 0) {
      for (const contact of alreadyReceived) {
        const logId = uuid()
        await this.messageLogRepository.create({
          id: logId,
          userId,
          leadId: null,
          phone: contact.phone,
          message: broadcast.warmupMessage,
          type: 'BROADCAST',
          status: 'PENDING',
        })
        await this.messageLogRepository.markFailed(logId, 'Número já recebeu mensagem em disparo anterior')
      }
      await this.prospectingBroadcastRepository.incrementFailedCount(broadcast.id, alreadyReceived.length)
      console.log(`[ProspectingBroadcast] ${alreadyReceived.length} contatos bloqueados (já receberam)`)
    }

    console.log(
      `[ProspectingBroadcast] Iniciando id=${broadcast.id} | contatos=${contacts.length} | bloqueados=${alreadyReceived.length}`,
    )

    for (const contact of contacts) {
      const logId = uuid()
      await this.messageLogRepository.create({
        id: logId,
        userId,
        leadId: null,
        phone: contact.phone,
        message: broadcast.warmupMessage,
        type: 'BROADCAST',
        status: 'PENDING',
      })

      const result = await sendWhatsAppMessageWithCredentials(
        instanceId,
        token,
        contact.phone,
        broadcast.warmupMessage,
      )
      await wapiProspectingDelay()

      if (result.success) {
        await this.contactListRepository.updateContactStatus(contact.id, 'WARMUP_SENT', {
          warmupSentAt: new Date(),
        })
        await this.prospectingBroadcastRepository.incrementCount(broadcast.id, 'totalSent')
        await this.messageLogRepository.markSent(logId)
        console.log(`[ProspectingBroadcast] ✓ Warmup enviado para ${contact.phone}`)
      } else {
        await this.contactListRepository.updateContactStatus(contact.id, 'FAILED', {
          errorMsg: result.error,
        })
        await this.prospectingBroadcastRepository.incrementCount(broadcast.id, 'totalFailed')
        await this.messageLogRepository.markFailed(logId, result.error ?? 'unknown error')
        console.error(`[ProspectingBroadcast] ✗ Falha para ${contact.phone}: ${result.error}`)
      }
    }

    await this.prospectingBroadcastRepository.updateStatus(broadcast.id, 'SENT', {
      finishedAt: new Date(),
    })
    console.log(`[ProspectingBroadcast] Concluído id=${broadcast.id}`)
  }
}
