import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MakeResetPasswordUseCase } from '@/factory/user/make-reset-password'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function ResetPasswordController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(6),
  })

  const { email, code, newPassword } = bodySchema.parse(request.body)

  try {
    const useCase = MakeResetPasswordUseCase()
    await useCase.execute({ email, code, newPassword })
    return reply.status(200).send({ message: 'Senha redefinida com sucesso.' })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
