import { FastifyReply, FastifyRequest } from 'fastify'
import { handleSpecificError } from '@/helpers/handleSpecificError'
import { DeleteProductFactory } from '@/factory/product/delete-product'

export async function DeleteProductController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sub } = request.user
    const { id } = request.params as { id: string }
    const deleteProductUseCase = DeleteProductFactory()
    const deletedProduct = await deleteProductUseCase.execute({
      userId: sub,
      productId: id,
    })
    return reply.status(204).send(deletedProduct)
  } catch (error) {
    handleSpecificError(error, reply)
  }
}
