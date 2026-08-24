import { DocumentRepository } from '@/repositories/document'
import { v4 as uuid } from 'uuid'

type DocumentRecord = {
  id: string
  userId: string
  title: string
  sourceType: 'TEXT' | 'PDF'
  content: string | null
  fileUrl: string | null
  status: 'PENDING' | 'PROCESSED' | 'FAILED'
  errorMsg: string | null
  createdAt: Date
}

export class InMemoryDocumentRepository implements DocumentRepository {
  public items: DocumentRecord[] = []

  async findById(id: string) {
    return this.items.find((d) => d.id === id) ?? null
  }

  async findAllByUserId(userId: string) {
    return this.items.filter((d) => d.userId === userId)
  }

  async findProcessedByUserId(userId: string) {
    return this.items.filter((d) => d.userId === userId && d.status === 'PROCESSED')
  }

  async create(data: any) {
    const document: DocumentRecord = {
      id: data.id ?? uuid(),
      userId: data.userId,
      title: data.title,
      sourceType: data.sourceType,
      content: data.content ?? null,
      fileUrl: data.fileUrl ?? null,
      status: data.status ?? 'PENDING',
      errorMsg: data.errorMsg ?? null,
      createdAt: new Date(),
    }
    this.items.push(document)
    return document
  }

  async updateStatus(id: string, status: DocumentRecord['status'], errorMsg?: string) {
    const idx = this.items.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error('Document not found')
    this.items[idx] = { ...this.items[idx], status, errorMsg: errorMsg ?? this.items[idx].errorMsg }
    return this.items[idx]
  }

  async setContent(id: string, content: string) {
    const idx = this.items.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error('Document not found')
    this.items[idx] = { ...this.items[idx], content }
    return this.items[idx]
  }

  async delete(id: string) {
    const idx = this.items.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error('Document not found')
    const [document] = this.items.splice(idx, 1)
    return document
  }
}
