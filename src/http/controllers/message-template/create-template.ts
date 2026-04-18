import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateTemplate } from '@/factory/message-template/make-create-template'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function createTemplateController(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    name: z.string().min(1),
    content: z.string().min(1),
    category: z.string().optional(),
    imageUrl: z.string().url().optional().nullable(),
    videoUrl: z.string().url().optional().nullable(),
  })
  const body = schema.parse(request.body)
  const { sub: userId } = request.user
  try {
    const template = await makeCreateTemplate().execute({ userId, ...body })
    return reply.status(201).send({ template })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
