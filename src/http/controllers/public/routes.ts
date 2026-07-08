import { FastifyInstance } from 'fastify'
import { publicSubscribeController } from './subscribe'

export async function publicRoutes(app: FastifyInstance) {
  app.addHook('onSend', (_req, reply, _payload, done) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type')
    done()
  })

  app.options('/public/subscribe', async (_req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type')
    return reply.status(200).send()
  })

  app.post('/public/subscribe', publicSubscribeController)
}
