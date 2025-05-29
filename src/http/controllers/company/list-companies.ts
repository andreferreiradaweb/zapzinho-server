import { FastifyReply, FastifyRequest } from 'fastify'
import { MakeListCompaniesUseCase } from '@/factory/company/make-list-companies'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function ListCompaniesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const listCompaniesUseCase = MakeListCompaniesUseCase()
    const companies = await listCompaniesUseCase.execute({ userId: sub })
    return reply.status(200).send(companies)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
