import { Document } from '@/lib/prisma'
import { DocumentRepository } from '@/repositories/document'
import { extractPdfText } from '@/services/pdf'
import { v4 as uuid } from 'uuid'

interface CreatePdfDocumentRequest {
  userId: string
  title: string
  fileUrl: string
}

export class CreatePdfDocumentUseCase {
  constructor(private repo: DocumentRepository) {}

  async execute({ userId, title, fileUrl }: CreatePdfDocumentRequest): Promise<Document> {
    const document = await this.repo.create({
      id: uuid(),
      userId,
      title,
      sourceType: 'PDF',
      fileUrl,
      status: 'PENDING',
    })

    try {
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error(`Falha ao baixar o PDF (HTTP ${response.status})`)
      const buffer = Buffer.from(await response.arrayBuffer())
      const content = await extractPdfText(buffer)
      await this.repo.setContent(document.id, content)
      return this.repo.updateStatus(document.id, 'PROCESSED')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao extrair texto do PDF'
      return this.repo.updateStatus(document.id, 'FAILED', message)
    }
  }
}
