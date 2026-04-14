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
    data: z.object({
      from: z.string(),               // "5511999999999@c.us"
      pushName: z.string().optional(),
      body: z.string().optional(),
      type: z.string().optional(),
    }),
  })

  const parsed = bodySchema.safeParse(request.body)
  if (!parsed.success) {
    return reply.status(200).send({ ok: false, reason: 'invalid_payload' })
  }

  const { instanceId, data } = parsed.data

  // Ignore non-chat messages (images, audio, etc. still capture the lead)
  // Groups have @g.us suffix — skip them
  if (data.from.endsWith('@g.us')) {
    return reply.status(200).send({ ok: true, reason: 'group_message_ignored' })
  }

  // Normalize phone: strip @c.us and any non-digit characters
  const phone = data.from.replace('@c.us', '').replace(/\D/g, '')
  const name = data.pushName ?? phone
  const message = data.body ?? ''

  try {
    const { lead, created } = await makeHandleIncomingMessage().execute({
      instanceId,
      phone,
      name,
      message,
    })

    return reply.status(200).send({ ok: true, created, leadId: lead.id })
  } catch {
    // If instanceId doesn't match any user, silently ack (don't expose internals)
    return reply.status(200).send({ ok: false, reason: 'instance_not_found' })
  }
}
