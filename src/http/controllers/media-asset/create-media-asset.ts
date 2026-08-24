import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateMediaAsset } from '@/factory/media-asset/make-create-media-asset'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function createMediaAssetController(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    type: z.enum(['IMAGE', 'VIDEO', 'AUDIO']),
    url: z.string().url(),
    title: z.string().min(1),
    description: z.string().optional(),
    productId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
  })
  const body = schema.parse(request.body)
  const { sub: userId } = request.user
  try {
    const mediaAsset = await makeCreateMediaAsset().execute({ userId, ...body })
    return reply.status(201).send({ mediaAsset })
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
