import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { DeleteFlowFactory } from '@/factory/flow/delete-flow'

const paramsSchema = z.object({ id: z.string().uuid() })

export async function DeleteFlowController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { sub } = req.user
    const { id } = paramsSchema.parse(req.params)
    const useCase = DeleteFlowFactory()
    await useCase.execute(id, sub)
    return reply.status(204).send()
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
