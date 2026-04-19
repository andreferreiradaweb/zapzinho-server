import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { resetCodeCache } from '@/use-cases/user/forgot-password'
import { InvalidResetCodeError } from '@/error/invalid-reset-code'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function VerifyResetCodeController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
  })

  const { email, code } = bodySchema.parse(request.body)

  try {
    const cached = resetCodeCache.get<string>(email)

    if (!cached || cached !== code) {
      throw new InvalidResetCodeError()
    }

    return reply.status(200).send({ message: 'Código válido.' })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
