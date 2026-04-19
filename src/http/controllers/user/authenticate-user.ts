import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MakeAuthenticateUseCase } from '@/factory/user/make-authenticate'
import { MakeSendVerificationEmailUseCase } from '@/factory/user/make-send-verification-email'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { EmailNotVerifiedError } from '@/error/email-not-verified'

export async function AuthenticateController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const AuthenticateBodySchema = z.object({
    email: z.string(),
    password: z.string().min(6),
  })
  const { email, password } = AuthenticateBodySchema.parse(request.body)
  try {
    const authenticateUseCase = MakeAuthenticateUseCase()
    const { user } = await authenticateUseCase.execute({ email, password })
    const token = await reply.jwtSign(
      { userRole: user.Role },
      { sign: { sub: user.id } },
    )
    return reply.status(200).send({ token })
  } catch (error) {
    if (error instanceof EmailNotVerifiedError) {
      try {
        const sendVerification = MakeSendVerificationEmailUseCase()
        await sendVerification.execute({ email })
      } catch (_) {
        // falha no envio não bloqueia a resposta
      }
      return reply.status(403).send({ message: error.message, emailNotVerified: true })
    }
    handleSpecificError(error, reply)
  }
}
