import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MakeAuthenticateUseCase } from '@/factory/user/make-authenticate'
import { handleSpecificError } from '@/helpers/handleSpecificError'

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
    handleSpecificError(error, reply)
  }
}
