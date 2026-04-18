import { FastifyRequest, FastifyReply } from 'fastify'
import { makeListAutomations } from '@/factory/automation/make-list-automations'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function listAutomationsController(request: FastifyRequest, reply: FastifyReply) {
  const { sub: userId } = request.user
  try {
    const automations = await makeListAutomations().execute(userId)
    return reply.status(200).send(automations)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
