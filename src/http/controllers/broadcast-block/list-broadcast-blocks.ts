import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListBroadcastBlocks } from '@/factory/broadcast-block/make-list-broadcast-blocks'

export async function listBroadcastBlocksController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { page = 1, limit = 20 } = z
    .object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
    })
    .parse(request.query)

  const { sub: userId } = request.user

  const { blocks, totalItems } = await makeListBroadcastBlocks().execute(
    userId,
    page,
    limit,
  )

  return reply.status(200).send({ blocks, totalItems })
}
