import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaContactListRepository } from '@/repositories/prisma/prospecting'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { prisma } from '@/lib/prisma'

const paramsSchema = z.object({ id: z.string().uuid() })

export async function getContactListCategoriesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = paramsSchema.parse(request.params)
  const userId = request.user.sub

  const list = await prisma.contactList.findUnique({ where: { id } })
  if (!list || list.userId !== userId) throw new InvalidCredentialsError()

  const repo = new PrismaContactListRepository()
  const categories = await repo.getDistinctCategories(id)

  return reply.send({ categories })
}
