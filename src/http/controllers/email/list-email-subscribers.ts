import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListEmailSubscribers } from '@/factory/email/make-list-email-subscribers'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

const paramsSchema = z.object({ listId: z.string().uuid() })
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(500).default(50),
})

export async function listEmailSubscribersController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { listId } = paramsSchema.parse(request.params)
  const { page, limit } = querySchema.parse(request.query)
  const userId = request.user.sub
  try {
    const result = await makeListEmailSubscribers().execute({
      emailListId: listId,
      userId,
      page,
      limit,
    })
    return reply.status(200).send(result)
  } catch (err) {
    if (err instanceof ResourceNotFound)
      return reply.status(404).send({ message: 'Lista não encontrada' })
    if (err instanceof InvalidCredentialsError)
      return reply.status(403).send({ message: 'Forbidden' })
    throw err
  }
}
