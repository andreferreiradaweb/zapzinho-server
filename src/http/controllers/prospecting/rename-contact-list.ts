import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

const paramsSchema = z.object({ id: z.string().uuid() })
const bodySchema = z.object({ name: z.string().min(1).max(100) })

export async function renameContactListController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = paramsSchema.parse(request.params)
  const { name } = bodySchema.parse(request.body)
  const userId = request.user.sub

  const list = await prisma.contactList.findUnique({ where: { id } })
  if (!list) throw new ResourceNotFound()
  if (list.userId !== userId) throw new InvalidCredentialsError()

  const updated = await prisma.contactList.update({
    where: { id },
    data: { name },
  })

  return reply.send({ contactList: updated })
}
