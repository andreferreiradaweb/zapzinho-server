import { FastifyInstance, RouteHandlerMethod } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { GetDashboardStatsController } from './get-stats'

export async function dashboardRoutes(app: FastifyInstance) {
  app.get(
    '/dashboard/stats',
    { onRequest: [verifyJwt] },
    GetDashboardStatsController as RouteHandlerMethod,
  )
}
