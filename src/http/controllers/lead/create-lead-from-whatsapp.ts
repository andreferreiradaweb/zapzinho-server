import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { CreateLeadFromWhatsappFactory } from '@/factory/lead/create-lead-from-whatsapp'

const bodySchema = z.object({
  storePhone: z.string().min(8),
  whatsappnumber: z.string().min(8).optional(),
  customername: z.string().min(1).optional(),
  origin: z.string().optional(),
  message: z.string().optional(),
})

export async function CreateLeadFromWhatsappController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { storePhone, whatsappnumber, customername, origin, message } =
      bodySchema.parse(request.body)

    const useCase = CreateLeadFromWhatsappFactory()
    const result = await useCase.execute({
      storePhone,
      telefone: whatsappnumber,
      nome: customername,
      origin,
      message,
    })

    return reply
      .status(result.created ? 201 : 200)
      .send(result)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
