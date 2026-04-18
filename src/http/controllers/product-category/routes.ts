import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { CreateProductCategoryController } from './create-product-category'
import { ListProductCategoriesController } from './list-product-categories'
import { UpdateProductCategoryController } from './update-product-category'
import { DeleteProductCategoryController } from './delete-product-category'

export async function productCategoryRoutes(app: FastifyInstance) {
  app.post('/product-categories', { onRequest: [verifyJwt] }, CreateProductCategoryController)
  app.get('/product-categories', { onRequest: [verifyJwt] }, ListProductCategoriesController)
  app.put('/product-categories', { onRequest: [verifyJwt] }, UpdateProductCategoryController)
  app.delete('/product-categories/:id', { onRequest: [verifyJwt] }, DeleteProductCategoryController)
}
