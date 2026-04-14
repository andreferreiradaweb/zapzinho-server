import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteBroadcast } from '@/factory/broadcast/make-delete-broadcast'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function deleteBroadcastController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
  const { sub: userId } = request.user

  try {
    await makeDeleteBroadcast().execute(id, userId)
    return reply.status(204).send()
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
