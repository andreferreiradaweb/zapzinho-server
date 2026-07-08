import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateEmailList } from '@/factory/email/make-create-email-list'

const bodySchema = z.object({ name: z.string().min(1) })

export async function createEmailListController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { name } = bodySchema.parse(request.body)
  const userId = request.user.sub
  const result = await makeCreateEmailList().execute(userId, name)
  return reply.status(201).send(result)
}
