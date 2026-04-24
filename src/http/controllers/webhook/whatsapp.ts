import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeHandleIncomingMessage } from '@/factory/webhook/make-handle-incoming-message'
import { env } from '@/config/validatedEnv'
import { addMessage as addClassificationMessage } from '@/services/lead-classification'
import { normalizePhone } from '@/helpers/normalizePhone'
import { PrismaContactListRepository } from '@/repositories/prisma/prospecting'
import { PrismaMessageLogRepository } from '@/repositories/prisma/message-log'
import { PrismaUserRepository } from '@/repositories/prisma/user'
import { sendWhatsAppMessageWithCredentials } from '@/services/wapi'
import { prisma } from '@/lib/prisma'
import { v4 as uuid } from 'uuid'

/**
 * POST /webhook/whatsapp
 *
 * W-API sends this payload on every incoming message:
 * {
 *   "event": "onmessage",
 *   "instanceId": "LITE-XXXX",
 *   "data": {
 *     "from": "5511999999999@c.us",
 *     "pushName": "João Silva",
 *     "body": "Oi, quero saber mais",
 *     "type": "chat"
 *   }
 * }
 *
 * Configure the webhook URL in the W-API panel as:
 *   https://yourapi.com/webhook/whatsapp?secret=WAPI_WEBHOOK_SECRET
 */
export async function whatsappWebhookController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Validate secret token if configured
  if (env.WAPI_WEBHOOK_SECRET) {
    const { secret } = (request.query as Record<string, string>)
    if (secret !== env.WAPI_WEBHOOK_SECRET) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
  }

  const bodySchema = z.object({
    event: z.string().optional(),
    instanceId: z.string(),
    fromMe: z.boolean().optional(),
    isGroup: z.boolean().optional(),
    chat: z.object({
      id: z.string(),
    }),
    sender: z.object({
      id: z.string().optional(),
      pushName: z.string().optional(),
    }).optional(),
    msgContent: z.object({
      conversation: z.string().optional(),
    }).optional(),
  })

  console.log('[Webhook] Incoming payload:', JSON.stringify(request.body))

  const parsed = bodySchema.safeParse(request.body)
  if (!parsed.success) {
    console.warn('[Webhook] Invalid payload:', parsed.error.format())
    return reply.status(200).send({ ok: false, reason: 'invalid_payload' })
  }

  const { instanceId, fromMe, isGroup, chat, sender, msgContent } = parsed.data

  // Variable-based lead capture only works for self-sent messages (fromMe)
  if (!fromMe) {
    return reply.status(200).send({ ok: true, reason: 'incoming_message_ignored' })
  }

  // Skip group messages
  if (isGroup === true) {
    return reply.status(200).send({ ok: true, reason: 'group_message_ignored' })
  }

  const phone = normalizePhone(chat.id)
  const name = sender?.pushName ?? phone
  const message = msgContent?.conversation ?? ''

  try {
    const result = await makeHandleIncomingMessage().execute({
      instanceId,
      phone,
      name,
      message,
    })

    if ('skipped' in result) {
      return reply.status(200).send({ ok: true, reason: 'vars_not_found_in_message' })
    }

    const { lead, created } = result

    if (message) {
      addClassificationMessage(lead.id, lead.userId, message, created)
    }

    // Check if this phone belongs to a prospecting contact waiting for a reply
    console.log(`[Webhook] Verificando prospecção: instanceId=${instanceId} phone=${phone} userId=${lead.userId}`)
    handleProspectingReply(instanceId, phone, lead.userId).catch((err) =>
      console.error('[Webhook] Prospecting reply error:', err),
    )

    return reply.status(200).send({ ok: true, created, leadId: lead.id })
  } catch (err) {
    console.error('[Webhook] Error:', err)
    return reply.status(200).send({ ok: false, reason: 'instance_not_found' })
  }
}

async function handleProspectingReply(_instanceId: string, phone: string, userId: string) {
  const contactListRepo = new PrismaContactListRepository()
  const contact = await contactListRepo.findContactByPhone(userId, phone)
  if (!contact) {
    console.log(`[Prospecting] Nenhum contato WARMUP_SENT encontrado para phone=${phone} userId=${userId}`)
    return
  }

  await contactListRepo.updateContactStatus(contact.id, 'REPLIED', { repliedAt: new Date() })

  const broadcast = await prisma.prospectingBroadcast.findFirst({
    where: { contactListId: contact.contactListId, status: { in: ['SENT', 'SENDING'] } },
    orderBy: { createdAt: 'desc' },
  })
  if (!broadcast) {
    console.log(`[Prospecting] Nenhum broadcast SENT/SENDING encontrado para contactListId=${contact.contactListId}`)
    return
  }

  // Use the user's prospecting credentials
  const userRepo = new PrismaUserRepository()
  const user = await userRepo.findUserById(userId)
  if (!user?.prospectingInstanceId || !user?.prospectingToken) {
    console.log(`[Prospecting] Credenciais de prospecção não configuradas para userId=${userId}`)
    return
  }

  const logRepo = new PrismaMessageLogRepository()
  const logId = uuid()

  await logRepo.create({
    id: logId,
    userId,
    leadId: null,
    phone,
    message: broadcast.templateMessage,
    type: 'BROADCAST',
    status: 'PENDING',
  })

  const result = await sendWhatsAppMessageWithCredentials(
    user.prospectingInstanceId,
    user.prospectingToken,
    phone,
    broadcast.templateMessage,
  )

  if (result.success) {
    await contactListRepo.updateContactStatus(contact.id, 'TEMPLATE_SENT', {
      templateSentAt: new Date(),
    })
    await logRepo.markSent(logId)
    console.log(`[Prospecting] ✓ Template enviado para ${phone}`)
  } else {
    await logRepo.markFailed(logId, result.error ?? 'unknown error')
    console.error(`[Prospecting] ✗ Falha ao enviar template para ${phone}: ${result.error}`)
  }
}
