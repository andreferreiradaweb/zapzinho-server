import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeAddBroadcastBlock } from '@/factory/broadcast-block/make-add-broadcast-block'
import { ResourceNotFound } from '@/error/resource-not-found'

export async function addBroadcastBlockController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { leadId } = z
    .object({ leadId: z.string().uuid() })
    .parse(request.body)

  const { sub: userId } = request.user

  try {
    const { block } = await makeAddBroadcastBlock().execute(userId, leadId)
    return reply.status(201).send({ block })
  } catch (err) {
    if (err instanceof ResourceNotFound) {
      return reply.status(404).send({ message: 'Lead not found' })
    }
    throw err
  }
}
