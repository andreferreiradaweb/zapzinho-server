import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeSendEmailCampaign } from '@/factory/email/make-send-email-campaign'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

const paramsSchema = z.object({ id: z.string().uuid() })

export async function sendEmailCampaignController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = paramsSchema.parse(request.params)
  const userId = request.user.sub
  try {
    await makeSendEmailCampaign().execute(id, userId)
    return reply.status(200).send({ message: 'Campanha iniciada' })
  } catch (err) {
    if (err instanceof ResourceNotFound)
      return reply.status(404).send({ message: 'Campanha não encontrada' })
    if (err instanceof InvalidCredentialsError)
      return reply.status(403).send({ message: 'Forbidden' })
    if (err instanceof Error)
      return reply.status(400).send({ message: err.message })
    throw err
  }
}
