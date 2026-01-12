import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { CustomerType, Role } from '@/lib/prisma'
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
    role: z.nativeEnum(Role),
    customerType: z.nativeEnum(CustomerType).optional(),
  })

  const { email, password, isActive, role, customerType, phoneNumber, id } =
    updateBodySchema.parse(request.body)

  try {
    const updateUseCase = MakeUpdateUseCase()
    const user = await updateUseCase.execute({
      id,
      email,
      password,
      isActive,
      role,
      phoneNumber,
      customerType,
    })
    return reply.status(201).send(user)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
