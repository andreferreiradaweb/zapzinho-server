import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { LeadStatus } from '@/lib/prisma'
import { CreateLeadFactory } from '@/factory/lead/create-lead'

const createLeadBodySchema = z.object({
  nome: z.string(),
  email: z.string().email(),
  telefone: z.string(),
  message: z.string(),
  Status: z.nativeEnum(LeadStatus),
  productId: z.string().optional(),
  userId: z.string(),
})

export async function CreateLeadController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { ip } = request
    const validatedBody = createLeadBodySchema.parse(request.body)
    const { nome, email, telefone, message, Status, productId, userId } =
      validatedBody

    const createLeadUseCase = CreateLeadFactory()
    const createdLead = await createLeadUseCase.execute({
      nome,
      email,
      telefone,
      message,
      Status,
      productId,
      userId,
      ip,
    })

    return reply.status(201).send(createdLead)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
