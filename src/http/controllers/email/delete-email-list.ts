import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteEmailList } from '@/factory/email/make-delete-email-list'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

const paramsSchema = z.object({ id: z.string().uuid() })

export async function deleteEmailListController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = paramsSchema.parse(request.params)
  const userId = request.user.sub
  try {
    await makeDeleteEmailList().execute(id, userId)
    return reply.status(204).send()
  } catch (err) {
    if (err instanceof ResourceNotFound)
      return reply.status(404).send({ message: 'Lista não encontrada' })
    if (err instanceof InvalidCredentialsError)
      return reply.status(403).send({ message: 'Forbidden' })
    throw err
  }
}
