import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeMoveToLead } from '@/factory/prospecting/make-move-to-lead'

const paramsSchema = z.object({ contactId: z.string().uuid() })

export async function moveToLeadController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { contactId } = paramsSchema.parse(request.params)
  const userId = request.user.sub

  const lead = await makeMoveToLead().execute(contactId, userId)
  return reply.status(201).send({ lead })
}
