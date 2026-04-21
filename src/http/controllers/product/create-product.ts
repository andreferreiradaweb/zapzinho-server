import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { CreateProductFactory } from '@/factory/product/create-product'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function CreateProductController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createProductBodySchema = z.object({
    id: z.string().nullish(),
    title: z.string(),
    description: z.string().nullish(),
    code: z.string().nullish(),
    price: z.string().nullish(),
    costPrice: z.string().nullish(),
    condition: z.string().nullish(),
    photos: z.array(z.string()),
    categoryId: z.string().uuid().nullish(),
  })

  const {
    id,
    title,
    description,
    code,
    price,
    costPrice,
    condition,
    photos,
    categoryId,
  } = createProductBodySchema.parse(request.body)

  try {
    const { sub } = request.user // sub representa o ID do usuário autenticado

    const createProductUseCase = CreateProductFactory()

    const createdProduct = await createProductUseCase.execute({
      id: id ?? undefined,
      title,
      description: description ?? undefined,
      code: code ?? undefined,
      price: price ?? undefined,
      costPrice: costPrice ?? undefined,
      condition: condition ?? undefined,
      photos,
      userId: sub,
      categoryId: categoryId ?? undefined,
    })

    return reply.status(201).send(createdProduct)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
