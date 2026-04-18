import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { MakeUpdateProductCategory } from '@/factory/product-category/make-update-product-category'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function UpdateProductCategoryController(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({ id: z.string().uuid(), name: z.string().min(1) })
  const { id, name } = bodySchema.parse(request.body)
  const { sub: userId } = request.user

  try {
    const result = await MakeUpdateProductCategory().execute({ id, name, userId })
    return reply.status(200).send(result)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
