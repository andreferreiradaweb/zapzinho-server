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
import { GetInstanceQrCodeController } from './get-instance-qrcode'
import { GetInstanceStatusController } from './get-instance-status'
import { DisconnectInstanceController } from './disconnect-instance'
import { ForgotPasswordController } from './forgot-password'
import { ResetPasswordController } from './reset-password'
import { VerifyResetCodeController } from './verify-reset-code'
import { SignupUserController } from './signup-user'
import { SendVerificationEmailController } from './send-verification-email'
import { VerifyEmailController } from './verify-email'

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
  app.post('/user/signup', SignupUserController)
  app.post('/user/signin', AuthenticateController)
  app.post('/user/send-verification-email', SendVerificationEmailController)
  app.post('/user/verify-email', VerifyEmailController)
  app.post('/user/forgot-password', ForgotPasswordController)
  app.post('/user/verify-reset-code', VerifyResetCodeController)
  app.post('/user/reset-password', ResetPasswordController)
  app.get('/user/:id', { onRequest: [verifyJwt] }, GetOneUserController)
  app.get(
    '/user/:id/instance/qrcode',
    { onRequest: [verifyJwt] },
    GetInstanceQrCodeController,
  )
  app.get(
    '/user/:id/instance/status',
    { onRequest: [verifyJwt] },
    GetInstanceStatusController,
  )
  app.post(
    '/user/:id/instance/disconnect',
    { onRequest: [verifyJwt] },
    DisconnectInstanceController,
  )
  app.get(
    '/user',
    { onRequest: [verifyJwt, verifyAdmin] },
    ListUsersController as RouteHandlerMethod,
  )
}
