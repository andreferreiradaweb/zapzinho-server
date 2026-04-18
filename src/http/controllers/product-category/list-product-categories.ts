import { FastifyRequest, FastifyReply } from 'fastify'
import { MakeListProductCategories } from '@/factory/product-category/make-list-product-categories'
import { handleSpecificError } from '@/helpers/handleSpecificError'

export async function ListProductCategoriesController(request: FastifyRequest, reply: FastifyReply) {
  const { sub: userId } = request.user

  try {
    const result = await MakeListProductCategories().execute({ userId })
    return reply.status(200).send(result)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
