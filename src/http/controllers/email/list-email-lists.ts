import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListEmailLists } from '@/factory/email/make-list-email-lists'

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
})

export async function listEmailListsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub
  const { page, limit } = querySchema.parse(request.query)
  const result = await makeListEmailLists().execute(userId, page, limit)
  return reply.status(200).send(result)
}
