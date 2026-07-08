import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeAddEmailSubscriber } from '@/factory/email/make-add-email-subscriber'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

const paramsSchema = z.object({ listId: z.string().uuid() })
const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export async function addEmailSubscriberController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { listId } = paramsSchema.parse(request.params)
  const { email, name } = bodySchema.parse(request.body)
  const userId = request.user.sub
  try {
    const result = await makeAddEmailSubscriber().execute({
      emailListId: listId,
      userId,
      email,
      name,
    })
    return reply.status(201).send(result)
  } catch (err) {
    if (err instanceof ResourceNotFound)
      return reply.status(404).send({ message: 'Lista não encontrada' })
    if (err instanceof InvalidCredentialsError)
      return reply.status(403).send({ message: 'Forbidden' })
    if (err instanceof Error)
      return reply.status(400).send({ message: err.message })
    throw err
  }
}
