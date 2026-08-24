import { PrismaDocumentRepository } from '@/repositories/prisma/document'
import { CreateTextDocumentUseCase } from '@/use-cases/document/create-text-document'

export function makeCreateTextDocument() {
  return new CreateTextDocumentUseCase(new PrismaDocumentRepository())
}
