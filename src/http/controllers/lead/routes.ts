import { FastifyInstance, RouteHandlerMethod } from 'fastify'
import { CreateLeadForLpController } from './create-lead-for-lp'
import { ListLeadsController } from './list-leads'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { UpdateLeadController } from './update-lead'
import { DeleteLeadController } from './delete-lead'
import { CreateLeadController } from './create-lead'

export async function leadRoutes(app: FastifyInstance) {
  app.post(
    '/lead',
    { onRequest: [verifyJwt] },
    CreateLeadController,
  )
  app.get(
    '/lead',
    { onRequest: [verifyJwt] },
    ListLeadsController as RouteHandlerMethod,
  )
  app.put('/lead', { onRequest: [verifyJwt] }, UpdateLeadController)
  app.delete('/lead/:id', { onRequest: [verifyJwt] }, DeleteLeadController)
  app.post('/lp/lead', CreateLeadForLpController)
}
