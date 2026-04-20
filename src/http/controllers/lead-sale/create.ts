import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { CreateLeadSaleFactory } from '@/factory/lead-sale/create-lead-sale'

const bodySchema = z.object({
  leadId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
  })).min(1),
})

export async function CreateLeadSaleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const { leadId, items } = bodySchema.parse(request.body)
    const useCase = CreateLeadSaleFactory()
    const sale = await useCase.execute({ leadId, userId: sub, items })
    return reply.status(201).send(sale)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
