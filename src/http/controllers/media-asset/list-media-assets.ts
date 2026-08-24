import { FastifyRequest, FastifyReply } from 'fastify'
import { makeListMediaAssets } from '@/factory/media-asset/make-list-media-assets'

export async function listMediaAssetsController(request: FastifyRequest, reply: FastifyReply) {
  const { sub: userId } = request.user
  const mediaAssets = await makeListMediaAssets().execute(userId)
  return reply.status(200).send({ mediaAssets })
}
