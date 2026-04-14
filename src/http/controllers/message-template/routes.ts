import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { createTemplateController } from './create-template'
import { listTemplatesController } from './list-templates'
import { updateTemplateController } from './update-template'
import { deleteTemplateController } from './delete-template'

export async function messageTemplateRoutes(app: FastifyInstance) {
  app.post('/template', { onRequest: [verifyJwt] }, createTemplateController)
  app.get('/template', { onRequest: [verifyJwt] }, listTemplatesController)
  app.put('/template/:id', { onRequest: [verifyJwt] }, updateTemplateController)
  app.delete('/template/:id', { onRequest: [verifyJwt] }, deleteTemplateController)
}
