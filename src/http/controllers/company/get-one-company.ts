import { FastifyReply, FastifyRequest } from 'fastify'
import { MakeGetOneCompanyUseCase } from '@/factory/company/make-get-one-company'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function GetOneCompanyController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const { id } = request.params as { id: string }
    const getOneCompanyUseCase = MakeGetOneCompanyUseCase()
    const company = await getOneCompanyUseCase.execute({
      userId: sub,
      companyId: id,
    })
    return reply.status(200).send(company)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
