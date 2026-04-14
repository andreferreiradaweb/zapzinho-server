import { Contact } from '@/lib/prisma'
import { ContactRepository } from '@/repositories/contact'

interface ListContactsRequest {
  userId: string
  page: number
  limit: number
  search: string
  tag?: string
}

interface ListContactsResponse {
  contacts: Contact[]
  totalItems: number
}

export class ListContactsUseCase {
  constructor(private contactRepository: ContactRepository) {}

  async execute({ userId, page, limit, search, tag }: ListContactsRequest): Promise<ListContactsResponse> {
    const offset = (page - 1) * limit
    const [contacts, totalItems] = await Promise.all([
      this.contactRepository.filterByUserId(userId, offset, limit, search, tag),
      this.contactRepository.countByUserId(userId, search, tag),
    ])
    return { contacts, totalItems }
  }
}
