import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateEmailCampaign } from '@/factory/email/make-create-email-campaign'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

const bodySchema = z.object({
  emailListId: z.string().uuid(),
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
})

export async function createEmailCampaignController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { emailListId, name, subject, body } = bodySchema.parse(request.body)
  const userId = request.user.sub
  try {
    const result = await makeCreateEmailCampaign().execute({
      userId,
      emailListId,
      name,
      subject,
      body,
    })
    return reply.status(201).send(result)
  } catch (err) {
    if (err instanceof ResourceNotFound)
      return reply.status(404).send({ message: 'Lista não encontrada' })
    if (err instanceof InvalidCredentialsError)
      return reply.status(403).send({ message: 'Forbidden' })
    throw err
  }
}
