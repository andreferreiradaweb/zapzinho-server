import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { DeleteLeadSaleFactory } from '@/factory/lead-sale/delete-lead-sale'

const paramsSchema = z.object({ saleId: z.string().uuid() })

export async function DeleteLeadSaleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const { saleId } = paramsSchema.parse(request.params)
    const useCase = DeleteLeadSaleFactory()
    await useCase.execute({ saleId, userId: sub })
    return reply.status(204).send()
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
