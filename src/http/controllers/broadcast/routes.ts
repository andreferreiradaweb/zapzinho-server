import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { createBroadcastController } from './create-broadcast'
import { listBroadcastsController } from './list-broadcasts'
import { sendBroadcastController } from './send-broadcast'
import { getBroadcastStatsController } from './get-broadcast-stats'
import { deleteBroadcastController } from './delete-broadcast'

export async function broadcastRoutes(app: FastifyInstance) {
  app.post('/broadcast', { onRequest: [verifyJwt] }, createBroadcastController)
  app.get('/broadcast', { onRequest: [verifyJwt] }, listBroadcastsController)
  app.get('/broadcast/:id/stats', { onRequest: [verifyJwt] }, getBroadcastStatsController)
  app.post('/broadcast/:id/send', { onRequest: [verifyJwt] }, sendBroadcastController)
  app.delete('/broadcast/:id', { onRequest: [verifyJwt] }, deleteBroadcastController)
}
