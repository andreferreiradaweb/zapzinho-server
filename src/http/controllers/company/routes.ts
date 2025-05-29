import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { ListCompaniesController } from './list-companies'
import { GetOneCompanyController } from './get-one-company'
import { CreateCompanyController } from './create-company'
import { DeleteCompanyController } from './delete-company'
import { UpdateCompanyController } from './update-company'

export async function companyRoutes(app: FastifyInstance) {
  app.get('/company', { onRequest: [verifyJwt] }, ListCompaniesController)
  app.get('/company/:id', { onRequest: [verifyJwt] }, GetOneCompanyController)
  app.post('/company', { onRequest: [verifyJwt] }, CreateCompanyController)
  app.delete(
    '/company/:id',
    { onRequest: [verifyJwt] },
    DeleteCompanyController,
  )
  app.put('/company/:id', { onRequest: [verifyJwt] }, UpdateCompanyController)
}
