import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGetContactList } from '@/factory/prospecting/make-get-contact-list'

const paramsSchema = z.object({ id: z.string().uuid() })
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(5000).default(50),
})

export async function getContactListController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = paramsSchema.parse(request.params)
  const { page, limit } = querySchema.parse(request.query)
  const userId = request.user.sub

  const result = await makeGetContactList().execute(id, userId, page, limit)
  return reply.status(200).send(result)
}
