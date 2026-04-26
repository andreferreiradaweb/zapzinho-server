import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { UpdateLeadSaleFactory } from '@/factory/lead-sale/update-lead-sale'

const paramsSchema = z.object({ saleId: z.string().uuid() })

const bodySchema = z.object({
  discount: z.number().min(0).default(0),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
    costPrice: z.number().min(0).nullable().optional(),
  })).min(1),
})

export async function UpdateLeadSaleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const { saleId } = paramsSchema.parse(request.params)
    const { items, discount } = bodySchema.parse(request.body)
    const useCase = UpdateLeadSaleFactory()
    const sale = await useCase.execute({ saleId, userId: sub, items, discount })
    return reply.status(200).send(sale)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
