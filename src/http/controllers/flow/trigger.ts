import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { TriggerFlowFactory } from '@/factory/flow/trigger-flow'

const paramsSchema = z.object({
  flowId: z.string().uuid(),
  leadId: z.string().uuid(),
})

export async function TriggerFlowController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { sub } = req.user
    const { flowId, leadId } = paramsSchema.parse(req.params)
    const useCase = TriggerFlowFactory()
    const result = await useCase.execute({ flowId, leadId, userId: sub })
    return reply.status(200).send({ sessionId: result.sessionId })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
