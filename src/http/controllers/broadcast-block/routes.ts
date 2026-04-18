import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { listBroadcastBlocksController } from './list-broadcast-blocks'
import { addBroadcastBlockController } from './add-broadcast-block'
import { removeBroadcastBlockController } from './remove-broadcast-block'

export async function broadcastBlockRoutes(app: FastifyInstance) {
  app.get('/broadcast-block', { onRequest: [verifyJwt] }, listBroadcastBlocksController)
  app.post('/broadcast-block', { onRequest: [verifyJwt] }, addBroadcastBlockController)
  app.delete('/broadcast-block/:leadId', { onRequest: [verifyJwt] }, removeBroadcastBlockController)
}
