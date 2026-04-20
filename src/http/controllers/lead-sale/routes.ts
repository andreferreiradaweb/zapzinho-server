import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { CreateLeadSaleController } from './create'
import { ListLeadSalesController } from './list-by-lead'

export async function leadSaleRoutes(app: FastifyInstance) {
  app.post('/lead-sale', { onRequest: [verifyJwt] }, CreateLeadSaleController)
  app.get('/lead/:leadId/sales', { onRequest: [verifyJwt] }, ListLeadSalesController)
}
