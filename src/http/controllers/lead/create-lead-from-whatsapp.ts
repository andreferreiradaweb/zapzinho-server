import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { CreateLeadFromWhatsappFactory } from '@/factory/lead/create-lead-from-whatsapp'

const bodySchema = z.object({
  storePhone: z.string().min(8),
  whatsappnumber: z.string().min(8),
  customername: z.string().min(1),
  origin: z.string().optional(),
})

export async function CreateLeadFromWhatsappController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { storePhone, whatsappnumber, customername, origin } = bodySchema.parse(
      request.body,
    )

    const useCase = CreateLeadFromWhatsappFactory()
    const { lead, created } = await useCase.execute({
      storePhone,
      telefone: whatsappnumber,
      nome: customername,
      origin,
    })

    return reply.status(created ? 201 : 200).send({ lead, created })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
