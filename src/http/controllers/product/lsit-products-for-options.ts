import { FastifyReply, FastifyRequest } from 'fastify'
import { ListProductsForOptionsFactory } from '@/factory/product/list-products-for-options'
import { handleSpecificError } from '@/helpers/handleSpecificError'


export async function ListProductsForOptionsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub } = request.user
  try {
    const listProductsForOptionsFactory = ListProductsForOptionsFactory()
    const products = await listProductsForOptionsFactory.execute({
      userId: sub,
    })
    return reply.status(200).send(products)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
