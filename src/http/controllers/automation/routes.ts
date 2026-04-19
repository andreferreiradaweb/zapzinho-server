import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { verifyIsActive } from '@/http/middlewares/verify-active'
import { createAutomationController } from './create-automation'
import { listAutomationsController } from './list-automations'
import { toggleAutomationController } from './toggle-automation'
import { deleteAutomationController } from './delete-automation'

export async function automationRoutes(app: FastifyInstance) {
  app.post('/automation', { onRequest: [verifyJwt] }, createAutomationController)
  app.get('/automation', { onRequest: [verifyJwt] }, listAutomationsController)
  app.patch('/automation/:id/toggle', { onRequest: [verifyJwt, verifyIsActive] }, toggleAutomationController)
  app.delete('/automation/:id', { onRequest: [verifyJwt] }, deleteAutomationController)
}
