import { FastifyReply, FastifyRequest } from 'fastify'
import { ListProductsFactory } from '@/factory/product/list-products'
import { handleSpecificError } from '@/helpers/handleSpecificError'

interface ListProductsRequestQuery {
  page?: number
  limit?: number
  search?: string
  userId: string,
}

export async function ListProductsForLpController(
  request: FastifyRequest<{
    Querystring: ListProductsRequestQuery
  }>,
  reply: FastifyReply,
) {
  const { page, limit, search, userId } = request.query
  try {
    const listProductsFactory = ListProductsFactory()
    const products = await listProductsFactory.execute({
      userId,
      page,
      limit,
      search,
    })
    return reply.status(200).send(products)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
