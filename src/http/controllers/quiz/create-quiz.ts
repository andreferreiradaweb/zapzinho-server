import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateQuiz } from '@/factory/quiz/make-create-quiz'

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function createQuizController(req: FastifyRequest, reply: FastifyReply) {
  const { name, description } = bodySchema.parse(req.body)
  const userId = req.user.sub
  const uc = makeCreateQuiz()
  const result = await uc.execute({ userId, name, description })
  return reply.status(201).send(result)
}
