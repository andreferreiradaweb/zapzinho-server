import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { CreateFlowController } from './create'
import { UpdateFlowController } from './update'
import { DeleteFlowController } from './delete'
import { ListFlowsController } from './list'
import { TriggerFlowController } from './trigger'

export async function flowRoutes(app: FastifyInstance) {
  app.get('/flows', { onRequest: [verifyJwt] }, ListFlowsController)
  app.post('/flows', { onRequest: [verifyJwt] }, CreateFlowController)
  app.put('/flows/:id', { onRequest: [verifyJwt] }, UpdateFlowController)
  app.delete('/flows/:id', { onRequest: [verifyJwt] }, DeleteFlowController)
  app.post('/flows/:flowId/trigger/:leadId', { onRequest: [verifyJwt] }, TriggerFlowController)
}
