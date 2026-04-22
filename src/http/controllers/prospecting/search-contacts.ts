import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { searchContactsViaSerpApi } from '@/services/serp-api'
import { prisma } from '@/lib/prisma'
import { env } from '@/config/validatedEnv'

const PAGE_SIZE = 20

function buildQueryKey(query: string, location?: string): string {
  const q = query.toLowerCase().trim()
  const l = (location ?? '').toLowerCase().trim()
  return l ? `${q}|${l}` : q
}

export async function searchContactsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { query, location, maxResults } = z
    .object({
      query: z.string().min(2),
      location: z.string().optional(),
      maxResults: z.coerce.number().int().min(10).max(60).default(60),
    })
    .parse(request.query)

  const userId = request.user.sub
  const dailyLimit = env.SERP_DAILY_LIMIT

  const startOfDay = new Date()
  startOfDay.setUTCHours(0, 0, 0, 0)

  const todayCredits = await prisma.serpSearchLog.count({
    where: { userId, createdAt: { gte: startOfDay } },
  })

  const creditsNeeded = Math.ceil(maxResults / PAGE_SIZE)
  const remaining = dailyLimit - todayCredits

  if (remaining <= 0) {
    return reply.status(429).send({
      message: `Limite de ${dailyLimit} créditos diários atingido. Tente novamente amanhã.`,
      remaining: 0,
      limit: dailyLimit,
    })
  }

  if (creditsNeeded > remaining) {
    return reply.status(429).send({
      message: `Esta busca requer ${creditsNeeded} créditos, mas você tem apenas ${remaining} disponível${remaining > 1 ? 'is' : ''} hoje. Reduza a quantidade de resultados.`,
      remaining,
      limit: dailyLimit,
    })
  }

  // Resolve offset for this query+location (continues where left off)
  const queryKey = buildQueryKey(query, location)
  const offsetRecord = await prisma.serpSearchOffset.upsert({
    where: { userId_queryKey: { userId, queryKey } },
    create: { userId, queryKey, nextStart: 0 },
    update: {},
  })
  const startFrom = offsetRecord.nextStart

  // Consume credits upfront
  await prisma.$transaction([
    prisma.serpSearchLog.createMany({
      data: Array.from({ length: creditsNeeded }, () => ({ userId })),
    }),
    prisma.serpSearchOffset.update({
      where: { userId_queryKey: { userId, queryKey } },
      data: { nextStart: startFrom + creditsNeeded * PAGE_SIZE },
    }),
  ])

  const remainingAfter = remaining - creditsNeeded

  try {
    const contacts = await searchContactsViaSerpApi(query, location, maxResults, startFrom)
    return reply.status(200).send({
      contacts,
      remaining: remainingAfter,
      limit: dailyLimit,
      creditsUsed: creditsNeeded,
      startFrom,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar contatos'
    return reply.status(500).send({ message })
  }
}
