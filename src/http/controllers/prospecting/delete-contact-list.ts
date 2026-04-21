import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

const paramsSchema = z.object({ id: z.string().uuid() })

export async function deleteContactListController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = paramsSchema.parse(request.params)
  const userId = request.user.sub

  const list = await prisma.contactList.findUnique({ where: { id } })
  if (!list) throw new ResourceNotFound()
  if (list.userId !== userId) throw new InvalidCredentialsError()

  const active = await prisma.prospectingBroadcast.findFirst({
    where: { contactListId: id, status: 'SENDING' },
  })
  if (active) {
    return reply.status(409).send({ message: 'Há um disparo em andamento para esta lista. Aguarde finalizar antes de excluir.' })
  }

  await prisma.prospectingBroadcast.deleteMany({ where: { contactListId: id } })
  await prisma.contactList.delete({ where: { id } })

  return reply.status(204).send()
}
