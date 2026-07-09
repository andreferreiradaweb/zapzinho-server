import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListQuizzes } from '@/factory/quiz/make-list-quizzes'

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
})

export async function listQuizzesController(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.sub
  const { page, limit } = querySchema.parse(req.query)
  const uc = makeListQuizzes()
  const result = await uc.execute(userId, page, limit)
  return reply.send(result)
}
