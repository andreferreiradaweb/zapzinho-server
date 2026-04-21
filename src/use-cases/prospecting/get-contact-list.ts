import { ContactListRepository } from '@/repositories/prospecting'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

export class GetContactListUseCase {
  constructor(private contactListRepository: ContactListRepository) {}

  async execute(id: string, userId: string, page: number, limit: number) {
    const contactList = await this.contactListRepository.findById(id)
    if (!contactList) throw new ResourceNotFound()
    if (contactList.userId !== userId) throw new InvalidCredentialsError()

    const offset = (page - 1) * limit
    const [contacts, totalItems] = await Promise.all([
      this.contactListRepository.listContacts(id, offset, limit),
      this.contactListRepository.countContacts(id),
    ])

    return { contactList, contacts, totalItems }
  }
}
