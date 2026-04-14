import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteContact } from '@/factory/contact/make-delete-contact'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function deleteContactController(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({ id: z.string().uuid() })
  const { id } = schema.parse(request.params)
  const { sub: userId } = request.user

  try {
    const useCase = makeDeleteContact()
    await useCase.execute(id, userId)
    return reply.status(204).send()
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
