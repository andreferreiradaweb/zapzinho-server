import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makePublicGetQuiz } from '@/factory/quiz/make-public-get-quiz'
import { makePublicSubmitQuiz } from '@/factory/quiz/make-public-submit-quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

const slugParams = z.object({ slug: z.string() })

const submitBody = z.object({
  name: z.string().min(1),
  email: z.string().default(''),
  phone: z.string().default(''),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        optionId: z.string().uuid().optional(),
        textValue: z.string().optional(),
      }),
    )
    .default([]),
})

export async function publicGetQuizController(req: FastifyRequest, reply: FastifyReply) {
  const { slug } = slugParams.parse(req.params)
  try {
    const result = await makePublicGetQuiz().execute(slug)
    return reply.send(result)
  } catch (err) {
    if (err instanceof ResourceNotFound) return reply.status(404).send({ message: 'Quiz não encontrado' })
    throw err
  }
}

export async function publicSubmitQuizController(req: FastifyRequest, reply: FastifyReply) {
  const { slug } = slugParams.parse(req.params)
  const body = submitBody.parse(req.body)
  try {
    const result = await makePublicSubmitQuiz().execute({ slug, ...body })
    return reply.send(result)
  } catch (err) {
    if (err instanceof ResourceNotFound) return reply.status(404).send({ message: 'Quiz não encontrado' })
    throw err
  }
}
