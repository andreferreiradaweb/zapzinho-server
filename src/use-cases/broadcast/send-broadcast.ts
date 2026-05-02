import { BroadcastRepository, BroadcastWithLeads } from '@/repositories/broadcast'
import { BroadcastBlockRepository } from '@/repositories/broadcast-block'
import { MessageLogRepository } from '@/repositories/message-log'
import { UserRepository } from '@/repositories/user'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import {
  sendWhatsAppMessageWithCredentials,
  sendWhatsAppImageWithCredentials,
  sendWhatsAppVideoWithCredentials,
  wapiDelay,
} from '@/services/wapi'
import { prisma } from '@/lib/prisma'
import { v4 as uuid } from 'uuid'

export class SendBroadcastUseCase {
  constructor(
    private broadcastRepository: BroadcastRepository,
    private messageLogRepository: MessageLogRepository,
    private blockRepository: BroadcastBlockRepository,
    private userRepository: UserRepository,
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
    const user = await this.userRepository.findUserById(userId)
    if (!user?.wapiInstanceId || !user?.wapiToken) {
      console.error(`[Broadcast] Instância WhatsApp não configurada para userId=${userId}`)
      await this.broadcastRepository.updateStatus(broadcast.id, 'FAILED').catch(() => null)
      return
    }
    const instanceId = user.wapiInstanceId
    const token = user.wapiToken

    const full = await prisma.broadcast.findUnique({
      where: { id: broadcast.id },
      include: { BroadcastLeads: { include: { Lead: true } } },
    })
    if (!full) return

    const blockedPhones = new Set(await this.blockRepository.findBlockedPhones(userId))

    console.log(`[Broadcast] Iniciando envio: id=${full.id} | destinatários=${full.BroadcastLeads.length}`)

    for (const bl of full.BroadcastLeads) {
      if (bl.status === 'SENT') continue
      if (blockedPhones.has(bl.Lead.telefone)) {
        console.log(`[Broadcast] Número bloqueado, pulando: ${bl.Lead.nome}`)
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
        result = await sendWhatsAppVideoWithCredentials(instanceId, token, bl.Lead.telefone, full.videoUrl!, full.message)
        await wapiDelay()
      } else if (hasImages) {
        result = await sendWhatsAppImageWithCredentials(instanceId, token, bl.Lead.telefone, full.imageUrls[0], full.message)
        await wapiDelay()
        for (let i = 1; i < full.imageUrls.length; i++) {
          await sendWhatsAppImageWithCredentials(instanceId, token, bl.Lead.telefone, full.imageUrls[i])
          await wapiDelay()
        }
      } else {
        result = await sendWhatsAppMessageWithCredentials(instanceId, token, bl.Lead.telefone, full.message)
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
