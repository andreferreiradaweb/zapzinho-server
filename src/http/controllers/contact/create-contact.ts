import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateContact } from '@/factory/contact/make-create-contact'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function createContactController(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    name: z.string().min(1),
    phone: z.string().min(8),
    email: z.string().email().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
  })

  const body = schema.parse(request.body)
  const { sub: userId } = request.user

  try {
    const useCase = makeCreateContact()
    const contact = await useCase.execute({ userId, ...body })
    return reply.status(201).send({ contact })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
