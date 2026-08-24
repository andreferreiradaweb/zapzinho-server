import { DocumentRepository } from '@/repositories/document'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { deleteFromCloudinary } from '@/services/cloudinary'

export class DeleteDocumentUseCase {
  constructor(private repo: DocumentRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const document = await this.repo.findById(id)
    if (!document) throw new ResourceNotFound()
    if (document.userId !== userId) throw new InvalidCredentialsError()
    await this.repo.delete(id)
    if (document.fileUrl) await deleteFromCloudinary(document.fileUrl)
  }
}
