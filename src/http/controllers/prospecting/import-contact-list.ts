import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeImportContactList } from '@/factory/prospecting/make-import-contact-list'
import { env } from '@/config/validatedEnv'

const contactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
})

const bodySchema = z.object({
  name: z.string().min(1),
  serpQuery: z.string().optional(),
  serpLocation: z.string().optional(),
  contacts: z.array(contactSchema).min(1).max(300),
})

export async function importContactListController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { name, serpQuery, serpLocation, contacts } = bodySchema.parse(request.body)
  const userId = request.user.sub

  if (contacts.length > env.CONTACT_LIST_MAX) {
    return reply.status(400).send({
      message: `Uma lista pode ter no máximo ${env.CONTACT_LIST_MAX} contatos.`,
    })
  }

  const { contactList, importedCount } = await makeImportContactList().execute({
    userId,
    name,
    serpQuery,
    serpLocation,
    contacts,
  })

  return reply.status(201).send({ contactList, importedCount })
}
