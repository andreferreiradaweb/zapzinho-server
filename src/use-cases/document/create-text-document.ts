import { Document } from '@/lib/prisma'
import { DocumentRepository } from '@/repositories/document'
import { v4 as uuid } from 'uuid'

interface CreateTextDocumentRequest {
  userId: string
  title: string
  content: string
}

export class CreateTextDocumentUseCase {
  constructor(private repo: DocumentRepository) {}

  async execute({ userId, title, content }: CreateTextDocumentRequest): Promise<Document> {
    return this.repo.create({
      id: uuid(),
      userId,
      title,
      sourceType: 'TEXT',
      content,
      status: 'PROCESSED',
    })
  }
}
