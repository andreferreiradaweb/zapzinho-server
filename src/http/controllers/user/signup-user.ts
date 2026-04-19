import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MakeRegisterUseCase } from '@/factory/user/make-register'
import { MakeSendVerificationEmailUseCase } from '@/factory/user/make-send-verification-email'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { Role } from '@/lib/prisma'

export async function SignupUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(6)
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$/),
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
  })

  const { email, password, name, phoneNumber } = bodySchema.parse(request.body)

  try {
    const registerUseCase = MakeRegisterUseCase()
    await registerUseCase.execute({
      email,
      password,
      name,
      phoneNumber,
      isActive: false,
      role: Role.CLIENT,
    })

    const sendVerificationEmail = MakeSendVerificationEmailUseCase()
    await sendVerificationEmail.execute({ email })

    return reply.status(201).send()
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
