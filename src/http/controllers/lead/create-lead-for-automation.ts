import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { LeadOption, LeadStatus } from '@/lib/prisma'
import { CreateLeadForAutomationFactory } from '@/factory/lead/create-lead-for-automation'

const createLeadForAutomationBodySchema = z.object({
  nome: z.string(),
  email: z.string().email().optional(),
  telefone: z.string(),
  message: z.string(),
  Status: z.nativeEnum(LeadStatus).default(LeadStatus.NOVO_INTERESSE),
  Option: z.nativeEnum(LeadOption).default(LeadOption.ATEMDIMENTO_IA),
  productId: z.string().optional(),
  userId: z.string(),
})

export async function CreateLeadForAutomationController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const validatedBody = createLeadForAutomationBodySchema.parse(request.body)
    const { nome, email, telefone, message, Status, Option, productId, userId } =
      validatedBody

    const createLeadUseCase = CreateLeadForAutomationFactory()
    const createdLead = await createLeadUseCase.execute({
      nome,
      email,
      telefone,
      message,
      Status,
      Option,
      productId,
      userId,
    })

    return reply.status(201).send(createdLead)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
