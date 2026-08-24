import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteDocument } from '@/factory/document/make-delete-document'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function deleteDocumentController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
  const { sub: userId } = request.user
  try {
    await makeDeleteDocument().execute(id, userId)
    return reply.status(204).send()
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
