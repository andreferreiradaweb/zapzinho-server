import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { createContactController } from './create-contact'
import { listContactsController } from './list-contacts'
import { updateContactController } from './update-contact'
import { deleteContactController } from './delete-contact'
import { importContactsController } from './import-contacts'

export async function contactRoutes(app: FastifyInstance) {
  app.post('/contact', { onRequest: [verifyJwt] }, createContactController)
  app.post('/contact/import', { onRequest: [verifyJwt] }, importContactsController)
  app.get('/contact', { onRequest: [verifyJwt] }, listContactsController)
  app.put('/contact/:id', { onRequest: [verifyJwt] }, updateContactController)
  app.delete('/contact/:id', { onRequest: [verifyJwt] }, deleteContactController)
}
