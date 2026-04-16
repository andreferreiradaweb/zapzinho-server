import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { UpdateProductFactory } from '@/factory/product/update-products'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function UpdateProductController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateProductBodySchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullish(),
    code: z.string().nullish(),
    price: z.string().nullish(),
    condition: z.string().nullish(),
    photos: z.array(z.string()),
  })

  const {
    id,
    title,
    description,
    code,
    price,
    condition,
    photos,
  } = updateProductBodySchema.parse(request.body)
  try {
    const { sub } = request.user
    const updateProductFactory = UpdateProductFactory()
    const updatedProduct = await updateProductFactory.execute({
      id,
      title,
      description: description ?? undefined,
      code: code ?? undefined,
      price: price ?? undefined,
      condition: condition ?? undefined,
      photos,
      userId: sub,
    })
    return reply.status(204).send(updatedProduct)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
