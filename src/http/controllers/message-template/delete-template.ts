import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteTemplate } from '@/factory/message-template/make-delete-template'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function deleteTemplateController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
  const { sub: userId } = request.user
  try {
    await makeDeleteTemplate().execute(id, userId)
    return reply.status(204).send()
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
