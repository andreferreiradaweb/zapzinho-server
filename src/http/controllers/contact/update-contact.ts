import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeUpdateContact } from '@/factory/contact/make-update-contact'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function updateContactController(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string().uuid() })
  const bodySchema = z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(8).optional(),
    email: z.string().email().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  })

  const { id } = paramsSchema.parse(request.params)
  const body = bodySchema.parse(request.body)
  const { sub: userId } = request.user

  try {
    const useCase = makeUpdateContact()
    const contact = await useCase.execute({ id, userId, ...body })
    return reply.status(200).send({ contact })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
