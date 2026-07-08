import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makePublicSubscribe } from '@/factory/email/make-public-subscribe'
import { ResourceNotFound } from '@/error/resource-not-found'

const bodySchema = z.object({
  token: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
})

export async function publicSubscribeController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { token, email, name } = bodySchema.parse(request.body)
  try {
    const result = await makePublicSubscribe().execute({
      publicToken: token,
      email,
      name,
    })
    return reply.status(200).send({ success: true, ...result })
  } catch (err) {
    if (err instanceof ResourceNotFound)
      return reply.status(404).send({ success: false, message: 'Lista não encontrada' })
    if (err instanceof Error)
      return reply.status(400).send({ success: false, message: err.message })
    throw err
  }
}
