import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { LeadStatus } from '@prisma/client'
import { UpdateLeadFactory } from '@/factory/lead/update-lead'

const updatedLeadBodySchema = z.object({
  id: z.string(),
  Status: z.nativeEnum(LeadStatus),
  nome: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  houseId: z.string().nullable(),
  message: z.string().optional(),
})

export async function UpdateLeadController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const validatedBody = updatedLeadBodySchema.parse(request.body)
    const { nome, email, telefone, Status, id, houseId, message } = validatedBody

    const updateLeadUseCase = UpdateLeadFactory()
    const updatedLead = await updateLeadUseCase.execute({
      id,
      Status,
      userId: sub,
      nome,
      email,
      telefone,
      houseId,
      message,
    })

    return reply.status(204).send(updatedLead)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
