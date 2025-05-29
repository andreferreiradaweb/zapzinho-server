import { FastifyReply, FastifyRequest } from 'fastify'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { DeleteLeadFactory } from '@/factory/lead/delete-lead'

export async function DeleteLeadController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const { id } = request.params as { id: string }
    const deleteLeadUseCase = DeleteLeadFactory()
    const deletedLead = await deleteLeadUseCase.execute({
      userId: sub,
      leadId: id,
    })
    return reply.status(204).send(deletedLead)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
