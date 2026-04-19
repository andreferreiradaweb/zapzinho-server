import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MakeSendVerificationEmailUseCase } from '@/factory/user/make-send-verification-email'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function SendVerificationEmailController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    email: z.string().email(),
  })

  const { email } = bodySchema.parse(request.body)

  try {
    const useCase = MakeSendVerificationEmailUseCase()
    await useCase.execute({ email })
    return reply.status(200).send({ message: 'Código de verificação enviado.' })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
