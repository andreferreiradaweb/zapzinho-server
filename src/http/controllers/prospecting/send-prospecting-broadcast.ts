import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeSendProspectingBroadcast } from '@/factory/prospecting/make-send-prospecting-broadcast'

const paramsSchema = z.object({ id: z.string().uuid() })

export async function sendProspectingBroadcastController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = paramsSchema.parse(request.params)
  const userId = request.user.sub

  await makeSendProspectingBroadcast().execute(id, userId)
  return reply.status(200).send({ message: 'Disparo de prospecção iniciado' })
}
