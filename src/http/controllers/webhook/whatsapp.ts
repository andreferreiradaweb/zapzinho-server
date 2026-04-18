import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeHandleIncomingMessage } from '@/factory/webhook/make-handle-incoming-message'
import { env } from '@/config/validatedEnv'

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

  // Skip messages sent by the bot itself
  if (fromMe === true) {
    return reply.status(200).send({ ok: true, reason: 'outgoing_message_ignored' })
  }

  // Skip group messages
  if (isGroup === true) {
    return reply.status(200).send({ ok: true, reason: 'group_message_ignored' })
  }

  const phone = chat.id.replace(/\D/g, '')
  const name = sender?.pushName ?? phone
  const message = msgContent?.conversation ?? ''

  try {
    const { lead, created } = await makeHandleIncomingMessage().execute({
      instanceId,
      phone,
      name,
      message,
    })

    return reply.status(200).send({ ok: true, created, leadId: lead.id })
  } catch (err) {
    console.error('[Webhook] Error:', err)
    return reply.status(200).send({ ok: false, reason: 'instance_not_found' })
  }
}
