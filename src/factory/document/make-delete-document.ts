import { PrismaDocumentRepository } from '@/repositories/prisma/document'
import { DeleteDocumentUseCase } from '@/use-cases/document/delete-document'

export function makeDeleteDocument() {
  return new DeleteDocumentUseCase(new PrismaDocumentRepository())
}
