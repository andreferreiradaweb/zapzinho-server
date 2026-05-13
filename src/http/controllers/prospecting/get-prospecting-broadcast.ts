import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGetProspectingBroadcastStatus } from '@/factory/prospecting/make-get-prospecting-broadcast-status'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

const paramsSchema = z.object({ id: z.string().uuid() })

export async function getProspectingBroadcastController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = paramsSchema.parse(request.params)
  const userId = request.user.sub

  try {
    const result = await makeGetProspectingBroadcastStatus().execute(id, userId)
    return reply.status(200).send(result)
  } catch (err) {
    if (err instanceof ResourceNotFound) return reply.status(404).send({ message: 'Broadcast not found' })
    if (err instanceof InvalidCredentialsError) return reply.status(403).send({ message: 'Forbidden' })
    throw err
  }
}
