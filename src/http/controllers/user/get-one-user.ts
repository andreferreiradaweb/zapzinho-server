import { FastifyReply, FastifyRequest } from 'fastify'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { GetOneUserFactory } from '@/factory/user/make-get-one-user'

export async function GetOneUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as { id: string }
    const getOneUserUseCase = GetOneUserFactory()
    const { user } = await getOneUserUseCase.execute({
      userId: id,
    })
    return reply.status(200).send(user)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
