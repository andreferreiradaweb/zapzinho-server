import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage, wapiDelay } from '@/services/wapi'
import { v4 as uuid } from 'uuid'

const REACTIVATION_MESSAGE =
  'Olá! Notamos que você ainda não configurou seus primeiros envios. ' +
  'Acesse o painel e comece a usar o CRM agora mesmo 🚀'

export async function runReactivationJob() {
  console.log('[Cron] Running reactivation job...')

  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      onboardingMessageSentAt: null,
      createdAt: { lte: threeDaysAgo },
      phoneNumber: { not: null },
    },
  })

  console.log(`[Cron] Reactivation: ${users.length} users to notify`)

  for (const user of users) {
    if (!user.phoneNumber) continue

    const result = await sendWhatsAppMessage({
      phone: user.phoneNumber,
      message: REACTIVATION_MESSAGE,
    })

    await prisma.messageLog.create({
      data: {
        id: uuid(),
        userId: user.id,
        phone: user.phoneNumber,
        message: REACTIVATION_MESSAGE,
        type: 'REACTIVATION',
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : undefined,
        errorMsg: result.error,
      },
    })

    if (result.success) {
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingMessageSentAt: new Date() },
      })
    }

    await wapiDelay()
  }

  console.log('[Cron] Reactivation job done.')
}
