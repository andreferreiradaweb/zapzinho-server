import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { CreateLeadSaleController } from './create'
import { ListLeadSalesController } from './list-by-lead'
import { UpdateLeadSaleController } from './update'
import { DeleteLeadSaleController } from './delete'

export async function leadSaleRoutes(app: FastifyInstance) {
  app.post('/lead-sale', { onRequest: [verifyJwt] }, CreateLeadSaleController)
  app.put('/lead-sale/:saleId', { onRequest: [verifyJwt] }, UpdateLeadSaleController)
  app.delete('/lead-sale/:saleId', { onRequest: [verifyJwt] }, DeleteLeadSaleController)
  app.get('/lead/:leadId/sales', { onRequest: [verifyJwt] }, ListLeadSalesController)
}
