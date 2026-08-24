import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteMediaAsset } from '@/factory/media-asset/make-delete-media-asset'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function deleteMediaAssetController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
  const { sub: userId } = request.user
  try {
    await makeDeleteMediaAsset().execute(id, userId)
    return reply.status(204).send()
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
