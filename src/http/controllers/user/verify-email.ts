import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MakeVerifyEmailUseCase } from '@/factory/user/make-verify-email'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function VerifyEmailController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
  })

  const { email, code } = bodySchema.parse(request.body)

  try {
    const useCase = MakeVerifyEmailUseCase()
    await useCase.execute({ email, code })
    return reply.status(200).send({ message: 'E-mail verificado com sucesso.' })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
