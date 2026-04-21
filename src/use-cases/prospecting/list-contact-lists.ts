import { ContactListRepository } from '@/repositories/prospecting'
import { prisma } from '@/lib/prisma'

export class ListContactListsUseCase {
  constructor(private contactListRepository: ContactListRepository) {}

  async execute(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [contactLists, totalItems] = await Promise.all([
      this.contactListRepository.findAllByUserId(userId, offset, limit),
      this.contactListRepository.countByUserId(userId),
    ])

    const listIds = contactLists.map((l) => l.id)
    const categoryRows = listIds.length
      ? await prisma.importedContact.groupBy({
          by: ['contactListId', 'category'],
          where: { contactListId: { in: listIds }, category: { not: null } },
        })
      : []

    const categoriesByList: Record<string, string[]> = {}
    for (const row of categoryRows) {
      if (!row.category) continue
      if (!categoriesByList[row.contactListId]) categoriesByList[row.contactListId] = []
      categoriesByList[row.contactListId].push(row.category)
    }

    const enriched = contactLists.map((l) => ({
      ...l,
      categories: categoriesByList[l.id] ?? [],
    }))

    return { contactLists: enriched, totalItems }
  }
}
