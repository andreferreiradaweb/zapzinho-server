import { FastifyReply, FastifyRequest } from 'fastify'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { DeleteUserFactory } from '@/factory/user/delete-user'

export async function DeleteUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as { id: string }
    const deleteUserUseCase = DeleteUserFactory()
    const deletedUser = await deleteUserUseCase.execute({
      userId: id,
    })
    return reply.status(204).send(deletedUser)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
