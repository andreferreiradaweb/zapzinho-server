import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MakeUpdateCompanyUseCase } from '@/factory/company/make-update-company'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function UpdateCompanyController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string(),
    phoneNumber: z.string(),
    whatsappNumber: z.string(),
    document: z.string(),
    creci: z.string().optional(),
    cep: z.string(),
    city: z.string(),
    complement: z.string(),
    neighbour: z.string(),
    number: z.string(),
    street: z.string(),
    uf: z.string(),
  })
  const {
    name,
    email,
    phoneNumber,
    whatsappNumber,
    document,
    creci,
    cep,
    city,
    complement,
    neighbour,
    number,
    street,
    uf,
  } = registerBodySchema.parse(request.body)
  try {
    const { sub } = request.user
    const { id } = request.params as { id: string }
    const UpdateCompanyUseCase = MakeUpdateCompanyUseCase()
    const company = await UpdateCompanyUseCase.execute({
      name,
      email,
      phoneNumber,
      whatsappNumber,
      document,
      creci,
      id,
      userId: sub,
      cep,
      city,
      complement,
      neighbour,
      number,
      street,
      uf,
    })
    return reply.status(204).send(company)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
