import { Document, Prisma } from '@/lib/prisma'

export interface DocumentRepository {
  findById(id: string): Promise<Document | null>
  findAllByUserId(userId: string): Promise<Document[]>
  findProcessedByUserId(userId: string): Promise<Document[]>
  create(data: Prisma.DocumentUncheckedCreateInput): Promise<Document>
  updateStatus(id: string, status: Document['status'], errorMsg?: string): Promise<Document>
  setContent(id: string, content: string): Promise<Document>
  delete(id: string): Promise<Document>
}
