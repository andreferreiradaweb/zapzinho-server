import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { GetLpConfigFactory } from '@/factory/user/get-lp-config'

const paramsSchema = z.object({
  userId: z.string().uuid(),
})

export async function GetLpConfigController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { userId } = paramsSchema.parse(request.params)

    const useCase = GetLpConfigFactory()
    const config = await useCase.execute({ userId })

    return reply.status(200).send(config)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
