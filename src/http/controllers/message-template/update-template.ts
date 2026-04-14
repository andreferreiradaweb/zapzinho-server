import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeUpdateTemplate } from '@/factory/message-template/make-update-template'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function updateTemplateController(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string().uuid() })
  const bodySchema = z.object({
    name: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    category: z.string().optional(),
  })
  const { id } = paramsSchema.parse(request.params)
  const body = bodySchema.parse(request.body)
  const { sub: userId } = request.user
  try {
    const template = await makeUpdateTemplate().execute({ id, userId, ...body })
    return reply.status(200).send({ template })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
