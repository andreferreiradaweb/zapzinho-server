import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import { ZodError } from 'zod'
import { env } from './config/validatedEnv'
import { usersRoutes } from './http/controllers/user/routes'
import { productRoutes } from './http/controllers/product/routes'
import { leadRoutes } from './http/controllers/lead/routes'
import { messageTemplateRoutes } from './http/controllers/message-template/routes'
import { broadcastRoutes } from './http/controllers/broadcast/routes'
import { broadcastBlockRoutes } from './http/controllers/broadcast-block/routes'
import { webhookRoutes } from './http/controllers/webhook/routes'
import { productCategoryRoutes } from './http/controllers/product-category/routes'
import { automationRoutes } from './http/controllers/automation/routes'
import { dashboardRoutes } from './http/controllers/dashboard/routes'
import { leadSaleRoutes } from './http/controllers/lead-sale/routes'
import { uploadRoutes } from './http/controllers/upload/routes'

export const app = fastify()

app.register(multipart, {
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limite bruto no multipart
})

app.register(fastifyCors, {
  origin:
    env.NODE_ENV === 'production'
      ? [env.FRONTEND_URL, /localhost:\d+$/]
      : true,
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  credentials: true,
})

app.register(fastifyRateLimit, {
  max: 120,
  timeWindow: '1 minute',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: '1d',
  },
})

app.register(usersRoutes)
app.register(leadRoutes)
app.register(productRoutes)
app.register(messageTemplateRoutes)
app.register(broadcastRoutes)
app.register(broadcastBlockRoutes)
app.register(webhookRoutes)
app.register(productCategoryRoutes)
app.register(automationRoutes)
app.register(dashboardRoutes)
app.register(leadSaleRoutes)
app.register(uploadRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error', issues: error.format() })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // Here we should log to Datadog/NewRelic/Sentry
  }

  return reply.status(500).send({ message: 'Internal server error' })
})
