import { ContactRepository } from '@/repositories/contact'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class DeleteContactUseCase {
  constructor(private contactRepository: ContactRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const contact = await this.contactRepository.findById(id)
    if (!contact) throw new ResourceNotFound()
    if (contact.userId !== userId) throw new InvalidCredentialsError()
    await this.contactRepository.delete(id)
  }
}
