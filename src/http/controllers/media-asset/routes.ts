import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { createMediaAssetController } from './create-media-asset'
import { listMediaAssetsController } from './list-media-assets'
import { deleteMediaAssetController } from './delete-media-asset'

export async function mediaAssetRoutes(app: FastifyInstance) {
  app.post('/media-assets', { onRequest: [verifyJwt] }, createMediaAssetController)
  app.get('/media-assets', { onRequest: [verifyJwt] }, listMediaAssetsController)
  app.delete('/media-assets/:id', { onRequest: [verifyJwt] }, deleteMediaAssetController)
}
