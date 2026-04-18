import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteAutomation } from '@/factory/automation/make-delete-automation'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function deleteAutomationController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
  const { sub: userId } = request.user

  try {
    await makeDeleteAutomation().execute(id, userId)
    return reply.status(204).send()
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
