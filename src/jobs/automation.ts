import { prisma } from '@/lib/prisma'
import { PrismaAutomationRepository } from '@/repositories/prisma/automation'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { PrismaBroadcastBlockRepository } from '@/repositories/prisma/broadcast-block'
import { sendWhatsAppMessage, sendWhatsAppImage, sendWhatsAppVideo, wapiDelay } from '@/services/wapi'
import { v4 as uuid } from 'uuid'

export async function runAutomationJob() {
  console.log('[Cron] Running automation job...')

  const automationRepo = new PrismaAutomationRepository()
  const leadRepo = new PrismaLeadRepository()
  const blockRepo = new PrismaBroadcastBlockRepository()

  const automations = await automationRepo.findAllActive()
  console.log(`[Cron] Automations: ${automations.length} active`)

  for (const automation of automations) {
    console.log(`[Cron] Processing automation "${automation.name}" (${automation.id})`)

    const leads = await leadRepo.findAllForBroadcast(
      automation.userId,
      automation.productId ?? undefined,
      automation.leadStatus ?? undefined,
      automation.lastMessageRange ?? undefined,
      automation.lastBroadcastRange ?? undefined,
      automation.categoryId ?? undefined,
    )

    const blockedIds = new Set(await blockRepo.findBlockedLeadIds(automation.userId))
    const eligible = leads.filter((l) => !blockedIds.has(l.id))

    console.log(`[Cron] Automation "${automation.name}": ${eligible.length} leads eligible`)

    for (const lead of eligible) {
      const logId = uuid()
      await prisma.messageLog.create({
        data: {
          id: logId,
          userId: automation.userId,
          leadId: lead.id,
          phone: lead.telefone,
          message: automation.message,
          type: 'AUTOMATION',
          status: 'PENDING',
        },
      })

      const hasVideo = !!automation.videoUrl
      const hasImages = automation.imageUrls && automation.imageUrls.length > 0
      let result

      if (hasVideo) {
        result = await sendWhatsAppVideo({
          phone: lead.telefone,
          videoUrl: automation.videoUrl!,
          caption: automation.message,
        })
        await wapiDelay()
      } else if (hasImages) {
        result = await sendWhatsAppImage({
          phone: lead.telefone,
          imageUrl: automation.imageUrls[0],
          caption: automation.message,
        })
        await wapiDelay()
        for (let i = 1; i < automation.imageUrls.length; i++) {
          await sendWhatsAppImage({ phone: lead.telefone, imageUrl: automation.imageUrls[i] })
          await wapiDelay()
        }
      } else {
        result = await sendWhatsAppMessage({ phone: lead.telefone, message: automation.message })
        await wapiDelay()
      }

      if (result.success) {
        await prisma.messageLog.update({ where: { id: logId }, data: { status: 'SENT', sentAt: new Date() } })
        await prisma.lead.update({ where: { id: lead.id }, data: { lastBroadcastAt: new Date() } })
        console.log(`[Cron] ✓ Automation sent to ${lead.telefone}`)
      } else {
        await prisma.messageLog.update({ where: { id: logId }, data: { status: 'FAILED', errorMsg: result.error } })
        console.error(`[Cron] ✗ Automation failed for ${lead.telefone}: ${result.error}`)
      }
    }
  }

  console.log('[Cron] Automation job done.')
}
