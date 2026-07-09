import { FastifyInstance } from 'fastify'
import { publicSubscribeController } from './subscribe'
import { publicGetQuizController, publicSubmitQuizController } from './quiz'

export async function publicRoutes(app: FastifyInstance) {
  const corsHeaders = {
    origin: '*',
    methods: 'GET, POST, OPTIONS',
    headers: 'Content-Type, Authorization',
  }

  app.addHook('onSend', (_req, reply, _payload, done) => {
    reply.header('Access-Control-Allow-Origin', corsHeaders.origin)
    reply.header('Access-Control-Allow-Methods', corsHeaders.methods)
    reply.header('Access-Control-Allow-Headers', corsHeaders.headers)
    done()
  })

  app.options('/public/subscribe', async (_req, reply) => {
    reply.header('Access-Control-Allow-Origin', corsHeaders.origin)
    reply.header('Access-Control-Allow-Methods', corsHeaders.methods)
    reply.header('Access-Control-Allow-Headers', corsHeaders.headers)
    return reply.status(200).send()
  })

  app.options('/public/quiz/:slug', async (_req, reply) => {
    reply.header('Access-Control-Allow-Origin', corsHeaders.origin)
    reply.header('Access-Control-Allow-Methods', corsHeaders.methods)
    reply.header('Access-Control-Allow-Headers', corsHeaders.headers)
    return reply.status(200).send()
  })

  app.post('/public/subscribe', publicSubscribeController)
  app.get('/public/quiz/:slug', publicGetQuizController)
  app.post('/public/quiz/:slug/submit', publicSubmitQuizController)
}
