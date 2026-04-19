import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'

export async function verifyIsActive(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub: userId } = request.user
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (user && !user.isActive) {
    return reply.status(403).send({
      message: 'Conta inativa. Aguarde a ativação pelo administrador.',
      accountInactive: true,
    })
  }
}
