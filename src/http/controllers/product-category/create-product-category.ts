import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { MakeCreateProductCategory } from '@/factory/product-category/make-create-product-category'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function CreateProductCategoryController(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({ name: z.string().min(1) })
  const { name } = schema.parse(request.body)
  const { sub: userId } = request.user

  try {
    const result = await MakeCreateProductCategory().execute({ name, userId })
    return reply.status(201).send(result)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
