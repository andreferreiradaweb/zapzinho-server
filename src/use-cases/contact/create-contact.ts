import { Contact } from '@/lib/prisma'
import { ContactRepository } from '@/repositories/contact'
import { v4 as uuid } from 'uuid'

interface CreateContactRequest {
  userId: string
  name: string
  phone: string
  email?: string
  tags?: string[]
  notes?: string
}

export class CreateContactUseCase {
  constructor(private contactRepository: ContactRepository) {}

  async execute(data: CreateContactRequest): Promise<Contact> {
    const existing = await this.contactRepository.findByPhone(data.userId, data.phone)
    if (existing) return existing

    return this.contactRepository.create({
      id: uuid(),
      userId: data.userId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      tags: data.tags ?? [],
      notes: data.notes,
    })
  }
}
