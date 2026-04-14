import { FastifyRequest, FastifyReply } from 'fastify'
import { makeListTemplates } from '@/factory/message-template/make-list-templates'

export async function listTemplatesController(request: FastifyRequest, reply: FastifyReply) {
  const { sub: userId } = request.user
  const templates = await makeListTemplates().execute(userId)
  return reply.status(200).send({ templates })
}
