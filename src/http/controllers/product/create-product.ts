import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { CreateProductFactory } from '@/factory/product/create-product'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function CreateProductController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createProductBodySchema = z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    code: z.string().optional(),
    price: z.string(),
    condition: z.string().optional(),
    photos: z.array(z.string()),
    companyId: z.string(),
  })

  const {
    id,
    title,
    description,
    code,
    price,
    condition,
    photos,
    companyId,
  } = createProductBodySchema.parse(request.body)

  try {
    const { sub } = request.user // sub representa o ID do usuário autenticado

    const createProductUseCase = CreateProductFactory()

    const createdProduct = await createProductUseCase.execute({
      id,
      title,
      description,
      code,
      price,
      condition,
      photos,
      companyId,
      userId: sub,
    })

    return reply.status(201).send(createdProduct)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
