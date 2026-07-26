import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteQuizLead } from '@/factory/quiz/make-delete-quiz-lead'
import { ResourceNotFound } from '@/error/resource-not-found'

const paramsSchema = z.object({
  id: z.string().uuid(),
  leadId: z.string().uuid(),
})

export async function deleteQuizLeadController(req: FastifyRequest, reply: FastifyReply) {
  const { id, leadId } = paramsSchema.parse(req.params)
  const userId = req.user.sub
  try {
    await makeDeleteQuizLead().execute(id, leadId, userId)
    return reply.status(204).send()
  } catch (err) {
    if (err instanceof ResourceNotFound) return reply.status(404).send({ message: 'Quiz ou lead não encontrado' })
    throw err
  }
}
