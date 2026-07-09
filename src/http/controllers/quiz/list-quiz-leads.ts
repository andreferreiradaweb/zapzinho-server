import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListQuizLeads } from '@/factory/quiz/make-list-quiz-leads'
import { ResourceNotFound } from '@/error/resource-not-found'

const paramsSchema = z.object({ id: z.string().uuid() })
const querySchema = z.object({ status: z.enum(['QUALIFIED', 'NOT_QUALIFIED']).optional() })

export async function listQuizLeadsController(req: FastifyRequest, reply: FastifyReply) {
  const { id } = paramsSchema.parse(req.params)
  const { status } = querySchema.parse(req.query)
  const userId = req.user.sub
  try {
    const result = await makeListQuizLeads().execute(id, userId, status)
    return reply.send(result)
  } catch (err) {
    if (err instanceof ResourceNotFound) return reply.status(404).send({ message: 'Quiz não encontrado' })
    throw err
  }
}
