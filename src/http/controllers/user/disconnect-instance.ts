import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { disconnectInstance } from '@/services/wapi'
import { Role } from '@/lib/prisma'

export async function DisconnectInstanceController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.string().uuid() })
  const { id } = paramsSchema.parse(request.params)

  const { sub: requesterId, userRole } = request.user
  if (userRole !== Role.ADMIN && requesterId !== id) {
    return reply.status(403).send({ message: 'Forbidden' })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return reply.status(404).send({ message: 'User not found' })
  }

  if (!user.wapiInstanceId) {
    return reply.status(400).send({ message: 'No instance configured for this user' })
  }

  const result = await disconnectInstance(user.wapiInstanceId)
  if (!result.success) {
    return reply.status(502).send({ message: result.error })
  }

  return reply.status(200).send({ message: 'Disconnected successfully' })
}
