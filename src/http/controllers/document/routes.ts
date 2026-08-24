import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { createTextDocumentController } from './create-text-document'
import { createPdfDocumentController } from './create-pdf-document'
import { listDocumentsController } from './list-documents'
import { deleteDocumentController } from './delete-document'

export async function documentRoutes(app: FastifyInstance) {
  app.post('/documents/text', { onRequest: [verifyJwt] }, createTextDocumentController)
  app.post('/documents/pdf', { onRequest: [verifyJwt] }, createPdfDocumentController)
  app.get('/documents', { onRequest: [verifyJwt] }, listDocumentsController)
  app.delete('/documents/:id', { onRequest: [verifyJwt] }, deleteDocumentController)
}
