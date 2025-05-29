import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { Role } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { userRole } = request.user
    if (userRole !== Role.ADMINISTRADOR) {
      throw new InvalidCredentialsError()
    }
  } catch (error) {
    return reply
      .status(401)
      .send({ message: 'Unauthorized. You are not an admin' })
  }
}
