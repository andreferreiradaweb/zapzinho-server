import { FastifyReply, FastifyRequest } from 'fastify'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { ListHouseOptionsFactory } from '@/factory/lead/list-house-options'

export async function ListHouseOptionsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub } = request.user
  try {
    const listLeadHouseOptionsUseCase = ListHouseOptionsFactory()
    const houseOptions = await listLeadHouseOptionsUseCase.execute({
      userId: sub,
    })
    return reply.status(200).send(houseOptions)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
