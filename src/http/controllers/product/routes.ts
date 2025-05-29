import { FastifyInstance, RouteHandlerMethod } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { UpdateProductController } from './update-product'
import { CreateProductController } from './create-product'
import { ListProductsController } from './list-products'
import { DeleteProductController } from './delete-product'

export async function productRoutes(app: FastifyInstance) {
  app.post('/products', { onRequest: [verifyJwt] }, CreateProductController)
  app.put('/products', { onRequest: [verifyJwt] }, UpdateProductController)
  app.get(
    '/products',
    { onRequest: [verifyJwt] },
    ListProductsController as RouteHandlerMethod,
  )
  app.delete('/products/:id', { onRequest: [verifyJwt] }, DeleteProductController)
}
