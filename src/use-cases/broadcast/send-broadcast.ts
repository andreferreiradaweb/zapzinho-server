import { BroadcastRepository, BroadcastWithLeads } from '@/repositories/broadcast'
import { MessageLogRepository } from '@/repositories/message-log'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { sendWhatsAppMessage, wapiDelay } from '@/services/wapi'
import { prisma } from '@/lib/prisma'
import { v4 as uuid } from 'uuid'

export class SendBroadcastUseCase {
  constructor(
    private broadcastRepository: BroadcastRepository,
    private messageLogRepository: MessageLogRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const broadcast = await this.broadcastRepository.findById(id)
    if (!broadcast) throw new ResourceNotFound()
    if (broadcast.userId !== userId) throw new InvalidCredentialsError()

    if (broadcast.status === 'SENDING' || broadcast.status === 'SENT') {
      return
    }

    await this.broadcastRepository.updateStatus(id, 'SENDING', { startedAt: new Date() })

    this.runSend(broadcast, userId).catch((err) => {
      console.error('[Broadcast] Fatal error during send:', err)
      this.broadcastRepository.updateStatus(id, 'FAILED').catch(() => null)
    })
  }

  private async runSend(broadcast: BroadcastWithLeads, userId: string) {
    const full = await prisma.broadcast.findUnique({
      where: { id: broadcast.id },
      include: { BroadcastLeads: { include: { Lead: true } } },
    })
    if (!full) return

    console.log(`[Broadcast] Iniciando envio: id=${full.id} | destinatários=${full.BroadcastLeads.length}`)

    for (const bl of full.BroadcastLeads) {
      if (bl.status === 'SENT') continue

      const logId = uuid()
      await this.messageLogRepository.create({
        id: logId,
        userId,
        leadId: bl.leadId,
        phone: bl.Lead.telefone,
        message: full.message,
        type: 'BROADCAST',
        status: 'PENDING',
      })

      console.log(`[Broadcast] Enviando para ${bl.Lead.nome} | telefone=${bl.Lead.telefone}`)

      const result = await sendWhatsAppMessage({
        phone: bl.Lead.telefone,
        message: full.message,
      })

      if (result.success) {
        await this.broadcastRepository.updateLeadStatus(bl.id, 'SENT')
        await this.broadcastRepository.incrementSentCount(full.id, 'totalSent')
        await this.messageLogRepository.markSent(logId)
        await prisma.lead.update({ where: { id: bl.leadId }, data: { lastBroadcastAt: new Date() } })
        console.log(`[Broadcast] ✓ Enviado para ${bl.Lead.telefone}`)
      } else {
        await this.broadcastRepository.updateLeadStatus(bl.id, 'FAILED', result.error)
        await this.broadcastRepository.incrementSentCount(full.id, 'totalFailed')
        await this.messageLogRepository.markFailed(logId, result.error ?? 'unknown error')
        console.error(`[Broadcast] ✗ Falha para ${bl.Lead.telefone}: ${result.error}`)
      }

      await wapiDelay()
    }

    await this.broadcastRepository.updateStatus(full.id, 'SENT', { finishedAt: new Date() })
    console.log(`[Broadcast] Concluído: id=${full.id}`)
  }
}
