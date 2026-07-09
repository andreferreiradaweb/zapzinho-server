import { FastifyRequest, FastifyReply } from 'fastify'
import { makeListQuizzes } from '@/factory/quiz/make-list-quizzes'

export async function listQuizzesController(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.sub
  const uc = makeListQuizzes()
  const result = await uc.execute(userId)
  return reply.send(result)
}
