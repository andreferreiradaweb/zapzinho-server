import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeToggleAutomation } from '@/factory/automation/make-toggle-automation'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function toggleAutomationController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
  const { isActive } = z.object({ isActive: z.boolean() }).parse(request.body)
  const { sub: userId } = request.user

  try {
    const automation = await makeToggleAutomation().execute(id, userId, isActive)
    return reply.status(200).send(automation)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
