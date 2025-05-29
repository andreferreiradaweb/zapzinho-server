import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import { ZodError } from 'zod'
import { env } from './config/validatedEnv'
import { usersRoutes } from './http/controllers/user/routes'
import { companyRoutes } from './http/controllers/company/routes'
import { productRoutes } from './http/controllers/product/routes'
import { leadRoutes } from './http/controllers/lead/routes'

export const app = fastify()

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  credentials: true,
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: '1d',
  },
})

app.register(usersRoutes)
app.register(companyRoutes)
app.register(productRoutes)
app.register(leadRoutes)

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
