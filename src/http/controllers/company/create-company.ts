import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MakeCreateCompanyUseCase } from '@/factory/company/make-create-company'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function CreateCompanyController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(),
    whatsappNumber: z.string(),
    document: z.string().nullable(),
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
    const createCompanyUseCase = MakeCreateCompanyUseCase()
    const company = await createCompanyUseCase.execute({
      name,
      email,
      phoneNumber,
      whatsappNumber,
      document,
      creci,
      userId: sub,
      cep,
      city,
      complement,
      neighbour,
      number,
      street,
      uf,
    })

    return reply.status(201).send(company)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
