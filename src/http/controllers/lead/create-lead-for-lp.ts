import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { LeadOption, LeadStatus } from '@/lib/prisma'
import { CreateLeadForLpFactory } from '@/factory/lead/create-lead-for-lp'

const createLeadForLpBodySchema = z.object({
  nome: z.string(),
  email: z.string().email(),
  telefone: z.string(),
  message: z.string(),
  Status: z.nativeEnum(LeadStatus),
  Option: z.nativeEnum(LeadOption),
  productId: z.string(),
  userId: z.string(),
})

export async function CreateLeadForLpController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { ip } = request
    const validatedBody = createLeadForLpBodySchema.parse(request.body)
    const { nome, email, telefone, message, Status, Option, productId, userId } =
      validatedBody

    const createLeadUseCase = CreateLeadForLpFactory()
    const createdLead = await createLeadUseCase.execute({
      nome,
      email,
      telefone,
      message,
      Status,
      productId,
      userId,
      ip,
      Option
    })

    return reply.status(201).send(createdLead)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
