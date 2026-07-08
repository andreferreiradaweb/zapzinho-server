import { FastifyRequest, FastifyReply } from 'fastify'
import { makeListEmailLists } from '@/factory/email/make-list-email-lists'

export async function listEmailListsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub
  const result = await makeListEmailLists().execute(userId)
  return reply.status(200).send(result)
}
