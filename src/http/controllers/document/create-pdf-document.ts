import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreatePdfDocument } from '@/factory/document/make-create-pdf-document'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function createPdfDocumentController(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    title: z.string().min(1),
    fileUrl: z.string().url(),
  })
  const body = schema.parse(request.body)
  const { sub: userId } = request.user
  try {
    const document = await makeCreatePdfDocument().execute({ userId, ...body })
    return reply.status(201).send({ document })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
