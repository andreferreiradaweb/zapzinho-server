import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeImportContactList } from '@/factory/prospecting/make-import-contact-list'

const contactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
  email: z.string().email().optional(),
})

const bodySchema = z.object({
  name: z.string().min(1),
  contacts: z.array(contactSchema).min(1),
})

export async function importContactListController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { name, contacts } = bodySchema.parse(request.body)
  const userId = request.user.sub

  const { contactList, importedCount } = await makeImportContactList().execute({
    userId,
    name,
    contacts,
  })

  return reply.status(201).send({ contactList, importedCount })
}
