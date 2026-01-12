import { FastifyReply, FastifyRequest } from 'fastify'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { LeadStatus } from '@/lib/prisma'
import { ListLeadsFactory } from '@/factory/lead/list-leads'

interface ListLeadsRequestQuery {
  page?: number
  limit?: number
  search?: string
  status?: LeadStatus
  startDate?: string
  endDate?: string
}

export async function ListLeadsController(
  request: FastifyRequest<{
    Querystring: ListLeadsRequestQuery
  }>,
  reply: FastifyReply,
) {
  const { sub } = request.user
  const { page, limit, search, status, startDate, endDate } = request.query
  try {
    const listLeadsUseCase = ListLeadsFactory()
    const leads = await listLeadsUseCase.execute({
      userId: sub,
      page,
      limit,
      search,
      status,
      startDate,
      endDate,
    })

    return reply.status(200).send(leads)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
