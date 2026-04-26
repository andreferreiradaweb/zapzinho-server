import { FastifyReply, FastifyRequest } from 'fastify'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { ListFlowsFactory } from '@/factory/flow/list-flows'

export async function ListFlowsController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { sub } = req.user
    const useCase = ListFlowsFactory()
    const flows = await useCase.execute(sub)
    return reply.status(200).send(flows)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
