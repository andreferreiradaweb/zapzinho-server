import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateBroadcast } from '@/factory/broadcast/make-create-broadcast'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function createBroadcastController(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    name: z.string().min(1),
    message: z.string().min(1),
    templateId: z.string().uuid().optional(),
    leadIds: z.array(z.string().uuid()).optional(),
    productId: z.string().uuid().optional(),
    status: z.enum(['NOVO_INTERESSE', 'CONTATO_FEITO', 'NEGOCIACAO', 'VENDIDO', 'NAO_INTERESSADO']).optional(),
    scheduledAt: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  })
  const body = schema.parse(request.body)
  const { sub: userId } = request.user

  try {
    const result = await makeCreateBroadcast().execute({ userId, ...body })
    return reply.status(201).send(result)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
