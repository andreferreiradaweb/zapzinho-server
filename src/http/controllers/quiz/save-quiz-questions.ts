import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeSaveQuizQuestions } from '@/factory/quiz/make-save-quiz-questions'
import { ResourceNotFound } from '@/error/resource-not-found'

const paramsSchema = z.object({ id: z.string().uuid() })

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  welcomeMessage: z.string().default(''),
  captureNameText: z.string().default('Qual é o seu nome?'),
  capturePhone: z.boolean().default(false),
  capturePhoneText: z.string().default('Qual é o seu WhatsApp?'),
  captureEmail: z.boolean().default(false),
  captureEmailText: z.string().default('Qual é o seu e-mail?'),
  resultQualifiedTitle: z.string().default('Parabéns!'),
  resultQualifiedMsg: z.string().default('Você foi qualificado! Nossa equipe entrará em contato em breve.'),
  resultNotQualTitle: z.string().default('Obrigado!'),
  resultNotQualMsg: z.string().default('Agradecemos sua participação. Fique de olho em nossas novidades.'),
  bgColor: z.string().regex(HEX_COLOR).default('#0d1b2e'),
  primaryColor: z.string().regex(HEX_COLOR).default('#00c853'),
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
  const { questions, ...settings } = bodySchema.parse(req.body)
  const userId = req.user.sub
  try {
    const result = await makeSaveQuizQuestions().execute(id, userId, questions, settings)
    return reply.send(result)
  } catch (err) {
    if (err instanceof ResourceNotFound) return reply.status(404).send({ message: 'Quiz não encontrado' })
    throw err
  }
}
