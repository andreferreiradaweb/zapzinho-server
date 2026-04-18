import { BroadcastRepository, BroadcastWithLeads } from '@/repositories/broadcast'
import { BroadcastBlockRepository } from '@/repositories/broadcast-block'
import { MessageLogRepository } from '@/repositories/message-log'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { sendWhatsAppMessage, sendWhatsAppImage, sendWhatsAppVideo, wapiDelay } from '@/services/wapi'
import { prisma } from '@/lib/prisma'
import { v4 as uuid } from 'uuid'

export class SendBroadcastUseCase {
  constructor(
    private broadcastRepository: BroadcastRepository,
    private messageLogRepository: MessageLogRepository,
    private blockRepository: BroadcastBlockRepository,
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

    const blockedIds = new Set(await this.blockRepository.findBlockedLeadIds(userId))

    console.log(`[Broadcast] Iniciando envio: id=${full.id} | destinatários=${full.BroadcastLeads.length}`)

    for (const bl of full.BroadcastLeads) {
      if (bl.status === 'SENT') continue
      if (blockedIds.has(bl.leadId)) {
        console.log(`[Broadcast] Lead bloqueado, pulando: ${bl.Lead.nome}`)
        continue
      }

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

      const hasVideo = !!full.videoUrl
      const hasImages = full.imageUrls && full.imageUrls.length > 0
      let result

      if (hasVideo) {
        result = await sendWhatsAppVideo({
          phone: bl.Lead.telefone,
          videoUrl: full.videoUrl!,
          caption: full.message,
        })
        await wapiDelay()
      } else if (hasImages) {
        // Send first image with message as caption
        result = await sendWhatsAppImage({
          phone: bl.Lead.telefone,
          imageUrl: full.imageUrls[0],
          caption: full.message,
        })
        await wapiDelay()

        // Send remaining images without caption
        for (let i = 1; i < full.imageUrls.length; i++) {
          await sendWhatsAppImage({ phone: bl.Lead.telefone, imageUrl: full.imageUrls[i] })
          await wapiDelay()
        }
      } else {
        result = await sendWhatsAppMessage({
          phone: bl.Lead.telefone,
          message: full.message,
        })
        await wapiDelay()
      }

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
    }

    await this.broadcastRepository.updateStatus(full.id, 'SENT', { finishedAt: new Date() })
    console.log(`[Broadcast] Concluído: id=${full.id}`)
  }
}
