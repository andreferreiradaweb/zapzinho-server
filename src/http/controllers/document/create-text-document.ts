import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateTextDocument } from '@/factory/document/make-create-text-document'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function createTextDocumentController(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
  })
  const body = schema.parse(request.body)
  const { sub: userId } = request.user
  try {
    const document = await makeCreateTextDocument().execute({ userId, ...body })
    return reply.status(201).send({ document })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
