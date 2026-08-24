import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { UploadImageController } from './image'
import { UploadVideoController } from './video'
import { UploadAudioController } from './audio'
import { UploadDocumentController } from './document'
import { DeleteUploadController } from './delete'

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload/image', { onRequest: [verifyJwt] }, UploadImageController)
  app.post('/upload/video', { onRequest: [verifyJwt] }, UploadVideoController)
  app.post('/upload/audio', { onRequest: [verifyJwt] }, UploadAudioController)
  app.post('/upload/document', { onRequest: [verifyJwt] }, UploadDocumentController)
  app.delete('/upload', { onRequest: [verifyJwt] }, DeleteUploadController)
}
