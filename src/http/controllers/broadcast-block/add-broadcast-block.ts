import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeAddBroadcastBlock } from '@/factory/broadcast-block/make-add-broadcast-block'

export async function addBroadcastBlockController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { phone } = z
    .object({ phone: z.string().min(8).max(20) })
    .parse(request.body)

  const { sub: userId } = request.user

  const { block } = await makeAddBroadcastBlock().execute(userId, phone)
  return reply.status(201).send({ block })
}
