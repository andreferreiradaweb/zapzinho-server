import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeImportContacts } from '@/factory/contact/make-import-contacts'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function importContactsController(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    contacts: z.array(
      z.object({
        name: z.string().min(1),
        phone: z.string().min(8),
        email: z.string().email().optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }),
    ).min(1),
  })

  const { contacts } = schema.parse(request.body)
  const { sub: userId } = request.user

  try {
    const useCase = makeImportContacts()
    const result = await useCase.execute({ userId, contacts })
    return reply.status(201).send(result)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
