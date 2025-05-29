import { FastifyReply, FastifyRequest } from 'fastify'
import { MakeDeleteCompanyUseCase } from '@/factory/company/make-delete-company'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function DeleteCompanyController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const { id } = request.params as { id: string }
    const deleteCompanyUseCase = MakeDeleteCompanyUseCase()
    const deletedCompany = await deleteCompanyUseCase.execute({
      userId: sub,
      companyId: id,
    })
    return reply.status(204).send(deletedCompany)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
