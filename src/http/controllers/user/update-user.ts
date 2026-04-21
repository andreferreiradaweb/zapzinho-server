import { FastifyReply, FastifyRequest } from 'fastify'
import { z, ZodError } from 'zod'
import { CustomerType, Role, UserPlan } from '@/lib/prisma'
import { MakeUpdateUseCase } from '@/factory/user/make-update'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function updateUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateBodySchema = z.object({
    id: z.string().uuid(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    phoneNumber: z.string().nullish(),
    isActive: z.boolean(),
    role: z.nativeEnum(Role),
    plan: z.nativeEnum(UserPlan).optional(),
    customerType: z.nativeEnum(CustomerType).optional(),
    name: z.string().nullish(),
    address: z.string().nullish(),
    wapiInstanceId: z.string().optional().nullable(),
    wapiToken: z.string().optional().nullable(),
    prospectingInstanceId: z.string().optional().nullable(),
    prospectingToken: z.string().optional().nullable(),
  })

  try {
    const {
      email, password, isActive, role, plan, customerType, phoneNumber, id,
      name, address, wapiInstanceId, wapiToken, prospectingInstanceId, prospectingToken,
    } = updateBodySchema.parse(request.body)

    const updateUseCase = MakeUpdateUseCase()
    const user = await updateUseCase.execute({
      id, email, password, isActive, role, plan,
      phoneNumber: phoneNumber ?? undefined,
      customerType,
      name: name ?? undefined,
      address: address ?? undefined,
      wapiInstanceId, wapiToken, prospectingInstanceId, prospectingToken,
    })
    return reply.status(201).send(user)
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return reply.status(400).send({ message: `Dados inválidos: ${fieldErrors}` })
    }
    handleSpecificError(error, reply)
  }
}
