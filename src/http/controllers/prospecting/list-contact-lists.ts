import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListContactLists } from '@/factory/prospecting/make-list-contact-lists'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export async function listContactListsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { page, limit } = querySchema.parse(request.query)
  const userId = request.user.sub

  const result = await makeListContactLists().execute(userId, page, limit)
  return reply.status(200).send(result)
}
