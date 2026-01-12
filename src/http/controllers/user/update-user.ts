import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { Plan, Role } from '@/lib/prisma'
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
    phoneNumber: z.string().default(''),
    isActive: z.boolean(),
    domain: z.string().optional(),
    role: z.nativeEnum(Role),
    plan: z.nativeEnum(Plan),
  })

  const { email, password, isActive, role, plan, phoneNumber, id, domain } =
    updateBodySchema.parse(request.body)

  try {
    const updateUseCase = MakeUpdateUseCase()
    const user = await updateUseCase.execute({
      id,
      email,
      password,
      isActive,
      domain,
      role,
      plan,
      phoneNumber,
    })
    return reply.status(201).send(user)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
