import { FastifyRequest, FastifyReply } from 'fastify'
import { makeListDocuments } from '@/factory/document/make-list-documents'

export async function listDocumentsController(request: FastifyRequest, reply: FastifyReply) {
  const { sub: userId } = request.user
  const documents = await makeListDocuments().execute(userId)
  return reply.status(200).send({ documents })
}
