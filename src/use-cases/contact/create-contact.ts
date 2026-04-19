import { Contact } from '@/lib/prisma'
import { ContactRepository } from '@/repositories/contact'
import { checkInactiveLimit } from '@/helpers/checkInactiveLimit'
import { prisma } from '@/lib/prisma'
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
    await checkInactiveLimit(data.userId, () =>
      prisma.contact.count({ where: { userId: data.userId } }),
    )

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
