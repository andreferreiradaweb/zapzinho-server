import { Contact } from '@/lib/prisma'
import { ContactRepository } from '@/repositories/contact'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

interface UpdateContactRequest {
  id: string
  userId: string
  name?: string
  phone?: string
  email?: string
  tags?: string[]
  notes?: string
  isActive?: boolean
}

export class UpdateContactUseCase {
  constructor(private contactRepository: ContactRepository) {}

  async execute(data: UpdateContactRequest): Promise<Contact> {
    const contact = await this.contactRepository.findById(data.id)
    if (!contact) throw new ResourceNotFound()
    if (contact.userId !== data.userId) throw new InvalidCredentialsError()

    return this.contactRepository.update({
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      tags: data.tags,
      notes: data.notes,
      isActive: data.isActive,
    })
  }
}
