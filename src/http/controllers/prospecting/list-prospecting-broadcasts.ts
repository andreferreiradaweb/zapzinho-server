import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListProspectingBroadcasts } from '@/factory/prospecting/make-list-prospecting-broadcasts'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(500).default(20),
})

export async function listProspectingBroadcastsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { page, limit } = querySchema.parse(request.query)
  const userId = request.user.sub

  const result = await makeListProspectingBroadcasts().execute(userId, page, limit)
  return reply.status(200).send(result)
}
