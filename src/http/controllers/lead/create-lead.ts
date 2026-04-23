import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { normalizePhone } from '@/helpers/normalizePhone'
import { LeadStatus } from '@/lib/prisma'
import { CreateLeadFactory } from '@/factory/lead/create-lead'

const createLeadBodySchema = z.object({
  nome: z.string(),
  email: z.string().email().optional().or(z.literal('')).transform(v => v || undefined),
  telefone: z.string().transform(v => normalizePhone(v)),
  message: z.string(),
  Status: z.nativeEnum(LeadStatus),
  id: z.string().uuid().optional(),
  createdAt: z.string().optional(),
  productId: z.string().uuid().optional().or(z.literal('')).transform(v => v || undefined),
  categoryId: z.string().uuid().optional().or(z.literal('')).transform(v => v || undefined),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
  })).optional(),
})

export async function CreateLeadController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const validatedBody = createLeadBodySchema.parse(request.body)
    const { nome, email, telefone, message, Status, productId, categoryId, id, createdAt, items } =
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
      productId,
      categoryId,
      items,
    })

    return reply.status(201).send(createdLead)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
