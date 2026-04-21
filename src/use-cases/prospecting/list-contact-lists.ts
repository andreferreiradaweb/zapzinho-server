import { ContactListRepository } from '@/repositories/prospecting'

export class ListContactListsUseCase {
  constructor(private contactListRepository: ContactListRepository) {}

  async execute(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [contactLists, totalItems] = await Promise.all([
      this.contactListRepository.findAllByUserId(userId, offset, limit),
      this.contactListRepository.countByUserId(userId),
    ])
    return { contactLists, totalItems }
  }
}
