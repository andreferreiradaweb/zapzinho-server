import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { LeadStatus } from '@/lib/prisma'
import { CreateLeadForAdminFactory } from '@/factory/lead/create-lead-for-admin'

const createLeadBodySchema = z.object({
  nome: z.string(),
  email: z.string().email(),
  telefone: z.string(),
  message: z.string(),
  Status: z.nativeEnum(LeadStatus),
  id: z.string().uuid().optional(),
  createdAt: z.string().optional(),
})

export async function CreateLeadForAdminController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const validatedBody = createLeadBodySchema.parse(request.body)
    const { nome, email, telefone, message, Status, id, createdAt } =
      validatedBody

    const createdAtDate = createdAt ? new Date(createdAt) : new Date()

    const createLeadUseCase = CreateLeadForAdminFactory()
    const createdLead = await createLeadUseCase.execute({
      nome,
      email,
      telefone,
      message,
      Status,
      userId: sub,
      id,
      createdAt: createdAtDate,
    })

    return reply.status(201).send(createdLead)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
