import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getInstanceStatus } from '@/services/wapi'
import { Role } from '@/lib/prisma'

export async function GetInstanceStatusController(
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
    return reply.status(200).send({ connected: false, status: 'no_instance' })
  }

  const result = await getInstanceStatus(user.wapiInstanceId)
  if (!result.success) {
    return reply.status(502).send({ message: result.error })
  }

  return reply.status(200).send({
    connected: result.connected,
    status: result.status,
    instanceId: user.wapiInstanceId,
  })
}
