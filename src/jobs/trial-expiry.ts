import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage, wapiDelay } from '@/services/wapi'
import { v4 as uuid } from 'uuid'

const TRIAL_EXPIRY_MESSAGE =
  'Olá! Seu período de teste está prestes a expirar em 2 dias. ' +
  'Assine agora para continuar usando todos os recursos do CRM sem interrupções 👉'

export async function runTrialExpiryJob() {
  console.log('[Cron] Running trial-expiry job...')

  const now = new Date()
  const twoDaysFromNow = new Date()
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      phoneNumber: { not: null },
      trialExpiresAt: {
        gte: now,
        lte: twoDaysFromNow,
      },
    },
  })

  console.log(`[Cron] Trial expiry: ${users.length} users to notify`)

  for (const user of users) {
    if (!user.phoneNumber) continue

    // Check if we already sent a trial expiry message today
    const alreadySent = await prisma.messageLog.findFirst({
      where: {
        userId: user.id,
        type: 'TRIAL_EXPIRY',
        createdAt: { gte: new Date(now.toDateString()) },
      },
    })
    if (alreadySent) continue

    const result = await sendWhatsAppMessage({
      phone: user.phoneNumber,
      message: TRIAL_EXPIRY_MESSAGE,
    })

    await prisma.messageLog.create({
      data: {
        id: uuid(),
        userId: user.id,
        phone: user.phoneNumber,
        message: TRIAL_EXPIRY_MESSAGE,
        type: 'TRIAL_EXPIRY',
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : undefined,
        errorMsg: result.error,
      },
    })

    await wapiDelay()
  }

  console.log('[Cron] Trial expiry job done.')
}
