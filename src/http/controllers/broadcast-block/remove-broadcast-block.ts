import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeRemoveBroadcastBlock } from '@/factory/broadcast-block/make-remove-broadcast-block'

export async function removeBroadcastBlockController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { leadId } = z
    .object({ leadId: z.string().uuid() })
    .parse(request.params)

  const { sub: userId } = request.user

  await makeRemoveBroadcastBlock().execute(userId, leadId)

  return reply.status(204).send()
}
