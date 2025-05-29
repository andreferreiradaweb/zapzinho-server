import { FastifyInstance, RouteHandlerMethod } from 'fastify'
import { registerUserController } from './register-user'
import { AuthenticateController } from './authenticate-user'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { verifyAdmin } from '@/http/middlewares/verify-admin'
import { updateUserController } from './update-user'
import { ListUsersController } from './list-users'
import { GetOneUserController } from './get-one-user'
import { SelfUpdateUserController } from './self-update-user'
import { DeleteUserController } from './delete-user'

export async function usersRoutes(app: FastifyInstance) {
  app.post(
    '/user/register',
    { onRequest: [verifyJwt, verifyAdmin] },
    registerUserController,
  )
  app.put(
    '/user/update',
    { onRequest: [verifyJwt, verifyAdmin] },
    updateUserController,
  )
  app.delete(
    '/user/delete/:id',
    { onRequest: [verifyJwt, verifyAdmin] },
    DeleteUserController,
  )
  app.put(
    '/user/self-update',
    { onRequest: [verifyJwt] },
    SelfUpdateUserController,
  )
  app.post('/user/signin', AuthenticateController)
  app.get('/user/:id', { onRequest: [verifyJwt] }, GetOneUserController)
  app.get(
    '/user',
    { onRequest: [verifyJwt, verifyAdmin] },
    ListUsersController as RouteHandlerMethod,
  )
}
