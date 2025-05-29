import { FastifyReply, FastifyRequest } from 'fastify'
import { ListProductsFactory } from '@/factory/product/list-products'
import { handleSpecificError } from '@/helpers/handleSpecificError'

interface ListProductsRequestQuery {
  page?: number
  limit?: number
  search?: string
}
export async function ListProductsController(
  request: FastifyRequest<{
    Querystring: ListProductsRequestQuery
  }>,
  reply: FastifyReply,
) {
  const { sub } = request.user
  const { page, limit, search } = request.query
  try {
    const listProductsFactory = ListProductsFactory()
    const products = await listProductsFactory.execute({
      userId: sub,
      page,
      limit,
      search,
    })
    return reply.status(200).send(products)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
