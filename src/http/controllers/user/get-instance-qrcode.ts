import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getInstanceQrCode } from '@/services/wapi'
import { Role } from '@/lib/prisma'
import { v4 as uuid } from 'uuid'

export async function GetInstanceQrCodeController(
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

  let instanceId = user.wapiInstanceId
  if (!instanceId) {
    instanceId = `zapzinho-${uuid().slice(0, 8)}`
    await prisma.user.update({
      where: { id },
      data: { wapiInstanceId: instanceId },
    })
  }

  const result = await getInstanceQrCode(instanceId)
  if (!result.success) {
    return reply.status(502).send({ message: result.error })
  }

  return reply.status(200).send({ instanceId, qrCode: result.qrCode })
}
