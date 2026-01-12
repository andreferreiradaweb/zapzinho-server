import '@fastify/jwt'
import { Role } from '@/lib/prisma'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      sub: string
      userRole: Role
    }
  }
}
