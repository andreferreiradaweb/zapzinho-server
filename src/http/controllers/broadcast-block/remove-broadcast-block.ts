import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeRemoveBroadcastBlock } from '@/factory/broadcast-block/make-remove-broadcast-block'

export async function removeBroadcastBlockController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = z
    .object({ id: z.string().uuid() })
    .parse(request.params)

  const { sub: userId } = request.user

  await makeRemoveBroadcastBlock().execute(userId, id)

  return reply.status(204).send()
}
