import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@/lib/prisma'
import { env } from '@/config/validatedEnv'

export async function getSearchCreditsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub
  const limit = env.SERP_DAILY_LIMIT

  const startOfDay = new Date()
  startOfDay.setUTCHours(0, 0, 0, 0)

  const used = await prisma.serpSearchLog.count({
    where: { userId, createdAt: { gte: startOfDay } },
  })

  return reply.status(200).send({
    remaining: Math.max(0, limit - used),
    limit,
  })
}
