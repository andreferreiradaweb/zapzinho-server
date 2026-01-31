import { FastifyReply, FastifyRequest } from 'fastify'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { GetOneProductFactory } from '@/factory/product/get-one-product'

interface GetOneProductRequestQuery {
  productId: string
  userId: string,
}

export async function GetOneProductController(
  request: FastifyRequest<{
    Querystring: GetOneProductRequestQuery
  }>,
  reply: FastifyReply,
) {
  const { productId, userId } = request.query
  try {
    const getOneProductFactory = GetOneProductFactory()
    const products = await getOneProductFactory.execute({
      productId,
      userId,
    })
    return reply.status(200).send(products)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
