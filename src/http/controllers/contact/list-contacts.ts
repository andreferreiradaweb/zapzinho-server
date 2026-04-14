import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListContacts } from '@/factory/contact/make-list-contacts'

export async function listContactsController(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
    search: z.string().default(''),
    tag: z.string().optional(),
  })

  const { page, limit, search, tag } = schema.parse(request.query)
  const { sub: userId } = request.user

  const useCase = makeListContacts()
  const result = await useCase.execute({ userId, page, limit, search, tag })
  return reply.status(200).send(result)
}
