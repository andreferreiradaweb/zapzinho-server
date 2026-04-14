import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeSendBroadcast } from '@/factory/broadcast/make-send-broadcast'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function sendBroadcastController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
  const { sub: userId } = request.user

  try {
    await makeSendBroadcast().execute(id, userId)
    return reply.status(202).send({ message: 'Broadcast iniciado' })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
