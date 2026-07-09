import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteQuiz } from '@/factory/quiz/make-delete-quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

const paramsSchema = z.object({ id: z.string().uuid() })

export async function deleteQuizController(req: FastifyRequest, reply: FastifyReply) {
  const { id } = paramsSchema.parse(req.params)
  const userId = req.user.sub
  try {
    await makeDeleteQuiz().execute(id, userId)
    return reply.status(204).send()
  } catch (err) {
    if (err instanceof ResourceNotFound) return reply.status(404).send({ message: 'Quiz não encontrado' })
    throw err
  }
}
