import { FastifyInstance, RouteHandlerMethod } from 'fastify'
import { CreateLeadController } from './create-lead'
import { ListLeadsController } from './list-leads'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { UpdateLeadController } from './update-lead'
import { DeleteLeadController } from './delete-lead'
import { ListHouseOptionsController } from './list-house-options'
import { CreateLeadForAdminController } from './create-lead-for-admin'

export async function leadRoutes(app: FastifyInstance) {
  app.post(
    '/lead',
    { onRequest: [verifyJwt] },
    CreateLeadForAdminController,
  )
  app.get(
    '/lead',
    { onRequest: [verifyJwt] },
    ListLeadsController as RouteHandlerMethod,
  )
  app.put('/lead', { onRequest: [verifyJwt] }, UpdateLeadController)
  app.delete('/lead/:id', { onRequest: [verifyJwt] }, DeleteLeadController)
  app.get(
    '/lead-options',
    { onRequest: [verifyJwt] },
    ListHouseOptionsController as RouteHandlerMethod,
  )

  app.post('/lp/lead', CreateLeadController)
}
