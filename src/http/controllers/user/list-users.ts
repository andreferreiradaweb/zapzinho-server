import { FastifyReply, FastifyRequest } from 'fastify'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { ListUsersFactory } from '@/factory/user/make-list-users'
import { Plan, Role } from '@prisma/client'

interface ListUsersRequestQuery {
  page?: number
  limit?: number
  search?: string
  plan?: Plan
  role?: Role
}
export async function ListUsersController(
  request: FastifyRequest<{
    Querystring: ListUsersRequestQuery
  }>,
  reply: FastifyReply,
) {
  const { page, limit, search, plan, role } = request.query
  try {
    const listUsersFactory = ListUsersFactory()
    const users = await listUsersFactory.execute({
      page,
      limit,
      search,
      plan,
      role,
    })
    return reply.status(200).send(users)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
