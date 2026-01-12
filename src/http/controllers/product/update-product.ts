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
    description: z.string().optional(),
    code: z.string().optional(),
    price: z.string(),
    condition: z.string().optional(),
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
      description,
      code,
      price,
      condition,
      photos,
      userId: sub,
    })
    return reply.status(204).send(updatedProduct)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
