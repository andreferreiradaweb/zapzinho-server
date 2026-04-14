import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListBroadcasts } from '@/factory/broadcast/make-list-broadcasts'

export async function listBroadcastsController(request: FastifyRequest, reply: FastifyReply) {
  const { page, limit } = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
  }).parse(request.query)
  const { sub: userId } = request.user
  const result = await makeListBroadcasts().execute({ userId, page, limit })
  return reply.status(200).send(result)
}
