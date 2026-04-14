import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGetBroadcastStats } from '@/factory/broadcast/make-get-broadcast-stats'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function getBroadcastStatsController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
  const { sub: userId } = request.user

  try {
    const broadcast = await makeGetBroadcastStats().execute(id, userId)
    return reply.status(200).send({ broadcast })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
