import { FastifyInstance } from 'fastify'
import { whatsappWebhookController } from './whatsapp'

export async function webhookRoutes(app: FastifyInstance) {
  // Public — no JWT. Security via ?secret= query param (set WAPI_WEBHOOK_SECRET in .env)
  app.post(
    '/webhook/whatsapp',
    { config: { rateLimit: { max: 300, timeWindow: '1 minute' } } },
    whatsappWebhookController,
  )
}
