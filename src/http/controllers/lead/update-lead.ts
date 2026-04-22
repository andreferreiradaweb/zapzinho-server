import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { normalizePhone } from '@/helpers/normalizePhone'
import { LeadStatus } from '@/lib/prisma'
import { UpdateLeadFactory } from '@/factory/lead/update-lead'

const updatedLeadBodySchema = z.object({
  id: z.string(),
  Status: z.nativeEnum(LeadStatus),
  nome: z.string().optional(),
  email: z.string().email().nullable().optional(),
  telefone: z.string().transform(v => normalizePhone(v)).optional(),
  productId: z.string().nullable().optional().or(z.literal('')).transform(v => v || undefined),
  categoryId: z.string().nullable().optional().or(z.literal('')).transform(v => v || undefined),
  message: z.string().optional(),
  sellerNote: z.string().max(500).nullable().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
  })).optional(),
})

export async function UpdateLeadController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const validatedBody = updatedLeadBodySchema.parse(request.body)
    const { nome, email, telefone, Status, id, productId, categoryId, message, sellerNote, items } = validatedBody

    const updateLeadUseCase = UpdateLeadFactory()
    const updatedLead = await updateLeadUseCase.execute({
      id,
      Status,
      userId: sub,
      nome,
      email,
      telefone,
      productId,
      categoryId,
      message,
      sellerNote,
      items,
    })

    return reply.status(204).send(updatedLead)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
