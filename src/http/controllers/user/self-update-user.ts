import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { MakeSelfUpdateUseCase } from '@/factory/user/make-self-update-user'

export async function SelfUpdateUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateBodySchema = z.object({
    password: z
      .string()
      .min(6)
      .optional(),
    phoneNumber: z.string().optional(),
    newPassword: z
      .string()
      .min(6)
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$/)
      .optional(),
  })
  const { sub } = request.user
  const { password, phoneNumber, newPassword } = updateBodySchema.parse(
    request.body,
  )
  try {
    const selfUpdateUseCase = MakeSelfUpdateUseCase()
    const user = await selfUpdateUseCase.execute({
      id: sub,
      password,
      phoneNumber,
      newPassword,
    })
    return reply.status(201).send(user)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
