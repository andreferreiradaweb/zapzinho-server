import { ContactRepository } from '@/repositories/contact'
import { v4 as uuid } from 'uuid'

interface ContactInput {
  name: string
  phone: string
  email?: string
  tags?: string[]
  notes?: string
}

interface ImportContactsRequest {
  userId: string
  contacts: ContactInput[]
}

interface ImportContactsResponse {
  imported: number
}

export class ImportContactsUseCase {
  constructor(private contactRepository: ContactRepository) {}

  async execute({ userId, contacts }: ImportContactsRequest): Promise<ImportContactsResponse> {
    const data = contacts.map((c) => ({
      id: uuid(),
      userId,
      name: c.name,
      phone: c.phone.replace(/\D/g, ''),
      email: c.email,
      tags: c.tags ?? [],
      notes: c.notes,
    }))

    const imported = await this.contactRepository.createMany(data)
    return { imported }
  }
}
