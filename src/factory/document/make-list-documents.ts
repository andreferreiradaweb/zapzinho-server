import { PrismaDocumentRepository } from '@/repositories/prisma/document'
import { ListDocumentsUseCase } from '@/use-cases/document/list-documents'

export function makeListDocuments() {
  return new ListDocumentsUseCase(new PrismaDocumentRepository())
}
