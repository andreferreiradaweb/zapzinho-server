import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateProspectingBroadcast } from '@/factory/prospecting/make-create-prospecting-broadcast'

const bodySchema = z.object({
  contactListId: z.string().uuid(),
  name: z.string().min(1),
  warmupMessage: z.string().min(1),
  templateMessage: z.string().min(1),
  categoryFilter: z.string().optional(),
})

export async function createProspectingBroadcastController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = bodySchema.parse(request.body)
  const userId = request.user.sub

  const result = await makeCreateProspectingBroadcast().execute({ userId, ...data })
  return reply.status(201).send(result)
}
