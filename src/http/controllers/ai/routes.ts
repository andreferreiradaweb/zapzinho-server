import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { generateAiTextController } from './generate'

export async function aiRoutes(app: FastifyInstance) {
  app.post('/ai/generate', { onRequest: [verifyJwt] }, generateAiTextController)
}
