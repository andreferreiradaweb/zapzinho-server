import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MakeForgotPasswordUseCase } from '@/factory/user/make-forgot-password'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function ForgotPasswordController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    email: z.string().email(),
  })

  const { email } = bodySchema.parse(request.body)

  try {
    const useCase = MakeForgotPasswordUseCase()
    await useCase.execute({ email })
    return reply.status(200).send({ message: 'Código enviado para o e-mail.' })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
