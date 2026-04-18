import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateAutomation } from '@/factory/automation/make-create-automation'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function createAutomationController(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    name: z.string().min(1),
    message: z.string().min(1),
    imageUrls: z.array(z.string().url()).optional(),
    videoUrl: z.string().url().optional().nullable(),
    templateId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    leadStatus: z.enum(['NOVO_INTERESSE', 'CONTATO_FEITO', 'NEGOCIACAO', 'VENDIDO', 'NAO_INTERESSADO']).optional(),
    lastMessageRange: z.enum(['1h', '2h', '4h', '8h', '1d', '1w', '1m', 'over1m']).optional(),
    lastBroadcastRange: z.enum(['6h', '12h', '1d', '3d', '1w', '2w', '1m']).optional(),
  })
  const body = schema.parse(request.body)
  const { sub: userId } = request.user

  try {
    const automation = await makeCreateAutomation().execute({ userId, ...body })
    return reply.status(201).send(automation)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
