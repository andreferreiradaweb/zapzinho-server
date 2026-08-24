import { PrismaDocumentRepository } from '@/repositories/prisma/document'
import { CreatePdfDocumentUseCase } from '@/use-cases/document/create-pdf-document'

export function makeCreatePdfDocument() {
  return new CreatePdfDocumentUseCase(new PrismaDocumentRepository())
}
