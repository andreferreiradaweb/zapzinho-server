import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { MakeDeleteProductCategory } from '@/factory/product-category/make-delete-product-category'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function DeleteProductCategoryController(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string().uuid() })
  const { id } = paramsSchema.parse(request.params)
  const { sub: userId } = request.user

  try {
    await MakeDeleteProductCategory().execute({ id, userId })
    return reply.status(204).send()
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
