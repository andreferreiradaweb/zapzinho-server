import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { LeadOption, LeadStatus } from '@/lib/prisma'
import { CreateLeadFactory } from '@/factory/lead/create-lead'

const createLeadBodySchema = z.object({
  nome: z.string(),
  email: z.string().email(),
  telefone: z.string(),
  message: z.string(),
  Status: z.nativeEnum(LeadStatus),
  Option: z.nativeEnum(LeadOption),
  id: z.string().uuid().optional(),
  createdAt: z.string().optional(),
  productId: z.string().uuid(),
})

export async function CreateLeadController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const validatedBody = createLeadBodySchema.parse(request.body)
    const { nome, email, telefone, message, Status, productId, Option, id, createdAt } =
      validatedBody

    const createdAtDate = createdAt ? new Date(createdAt) : new Date()

    const createLeadUseCase = CreateLeadFactory()
    const createdLead = await createLeadUseCase.execute({
      nome,
      email,
      telefone,
      message,
      Status,
      userId: sub,
      id,
      createdAt: createdAtDate,
      Option,
      productId,
    })

    return reply.status(201).send(createdLead)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
