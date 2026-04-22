import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeAddBroadcastBlock } from '@/factory/broadcast-block/make-add-broadcast-block'

export async function addBroadcastBlockController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { phone, name } = z
    .object({
      phone: z.string().min(8).max(20),
      name: z.string().optional(),
    })
    .parse(request.body)

  const { sub: userId } = request.user

  const digits = phone.replace(/\D/g, '')
  const normalized = digits.startsWith('55') ? digits : `55${digits}`

  const { block } = await makeAddBroadcastBlock().execute(userId, normalized, name)
  return reply.status(201).send({ block })
}
