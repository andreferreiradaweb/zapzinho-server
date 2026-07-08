import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeRemoveEmailSubscriber } from '@/factory/email/make-remove-email-subscriber'
import { ResourceNotFound } from '@/error/resource-not-found'

const paramsSchema = z.object({ subscriberId: z.string().uuid() })

export async function removeEmailSubscriberController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { subscriberId } = paramsSchema.parse(request.params)
  try {
    await makeRemoveEmailSubscriber().execute(subscriberId)
    return reply.status(204).send()
  } catch (err) {
    if (err instanceof ResourceNotFound)
      return reply.status(404).send({ message: 'Subscriber não encontrado' })
    throw err
  }
}
