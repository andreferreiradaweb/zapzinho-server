import { ContactList } from '@/lib/prisma'
import { ContactListRepository } from '@/repositories/prospecting'
import { normalizePhone } from '@/helpers/normalizePhone'
import { v4 as uuid } from 'uuid'

interface ImportContactListRequest {
  userId: string
  name: string
  serpQuery?: string
  serpLocation?: string
  contacts: Array<{ name: string; phone: string; email?: string; website?: string; address?: string; category?: string }>
}

interface ImportContactListResponse {
  contactList: ContactList
  importedCount: number
}

export class ImportContactListUseCase {
  constructor(private contactListRepository: ContactListRepository) {}

  async execute(data: ImportContactListRequest): Promise<ImportContactListResponse> {
    const contactList = await this.contactListRepository.create({
      id: uuid(),
      userId: data.userId,
      name: data.name,
      serpQuery: data.serpQuery,
      serpLocation: data.serpLocation,
    })

    const normalized = data.contacts
      .map((c) => ({ ...c, phone: normalizePhone(c.phone) }))
      .filter((c) => c.phone.length >= 10)

    const unique = this.deduplicateByPhone(normalized)

    if (unique.length > 0) {
      await this.contactListRepository.addContacts(contactList.id, unique)
    }

    return { contactList, importedCount: unique.length }
  }

  private deduplicateByPhone(
    contacts: Array<{ name: string; phone: string; email?: string; website?: string; address?: string; category?: string }>,
  ) {
    const seen = new Set<string>()
    return contacts.filter((c) => {
      if (seen.has(c.phone)) return false
      seen.add(c.phone)
      return true
    })
  }
}
