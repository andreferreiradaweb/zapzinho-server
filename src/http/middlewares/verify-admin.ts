import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { Role } from '@/lib/prisma'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { userRole } = request.user
    if (userRole !== Role.ADMIN) {
      throw new InvalidCredentialsError()
    }
  } catch (error) {
    return reply
      .status(401)
      .send({ message: 'Unauthorized. You are not an admin' })
  }
}
