import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeSaveQuizQuestions } from '@/factory/quiz/make-save-quiz-questions'
import { ResourceNotFound } from '@/error/resource-not-found'

const paramsSchema = z.object({ id: z.string().uuid() })

const bodySchema = z.object({
  questions: z.array(
    z.object({
      text: z.string().min(1),
      type: z.enum(['TEXT', 'RADIO']),
      order: z.number().int().min(0),
      options: z
        .array(
          z.object({
            text: z.string().min(1),
            order: z.number().int().min(0),
            isQualifying: z.boolean().default(false),
          }),
        )
        .default([]),
    }),
  ),
})

export async function saveQuizQuestionsController(req: FastifyRequest, reply: FastifyReply) {
  const { id } = paramsSchema.parse(req.params)
  const { questions } = bodySchema.parse(req.body)
  const userId = req.user.sub
  try {
    const result = await makeSaveQuizQuestions().execute(id, userId, questions)
    return reply.send(result)
  } catch (err) {
    if (err instanceof ResourceNotFound) return reply.status(404).send({ message: 'Quiz não encontrado' })
    throw err
  }
}
