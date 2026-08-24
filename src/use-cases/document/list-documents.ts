import { Document } from '@/lib/prisma'
import { DocumentRepository } from '@/repositories/document'

export class ListDocumentsUseCase {
  constructor(private repo: DocumentRepository) {}

  async execute(userId: string): Promise<Document[]> {
    return this.repo.findAllByUserId(userId)
  }
}
