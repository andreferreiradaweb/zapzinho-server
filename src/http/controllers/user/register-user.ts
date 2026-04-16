import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MakeRegisterUseCase } from '@/factory/user/make-register'
import { Role } from '@/lib/prisma'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function registerUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerBodySchema = z.object({
    email: z.string().email(),
    phoneNumber: z.string().optional(),
    password: z
      .string()
      .min(6)
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$/),
    isActive: z.boolean(),
    role: z.nativeEnum(Role),
    name: z.string().optional(),
    address: z.string().optional(),
  })

  const { email, password, isActive, role, phoneNumber, name, address } =
    registerBodySchema.parse(request.body)

  try {
    const registerUseCase = MakeRegisterUseCase()
    await registerUseCase.execute({
      email,
      password,
      isActive,
      role,
      phoneNumber,
      name,
      address,
    })
    return reply.status(201).send()
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
