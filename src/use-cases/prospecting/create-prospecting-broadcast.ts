import { ProspectingBroadcast } from '@/lib/prisma'
import {
  ContactListRepository,
  ProspectingBroadcastRepository,
} from '@/repositories/prospecting'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { v4 as uuid } from 'uuid'

interface CreateProspectingBroadcastRequest {
  userId: string
  contactListId: string
  name: string
  warmupMessage: string
  templateMessage: string
  categoryFilter?: string
}

interface CreateProspectingBroadcastResponse {
  broadcast: ProspectingBroadcast
  recipientCount: number
}

export class CreateProspectingBroadcastUseCase {
  constructor(
    private contactListRepository: ContactListRepository,
    private prospectingBroadcastRepository: ProspectingBroadcastRepository,
  ) {}

  async execute(
    data: CreateProspectingBroadcastRequest,
  ): Promise<CreateProspectingBroadcastResponse> {
    const list = await this.contactListRepository.findById(data.contactListId)
    if (!list) throw new ResourceNotFound()
    if (list.userId !== data.userId) throw new InvalidCredentialsError()

    const broadcast = await this.prospectingBroadcastRepository.create({
      id: uuid(),
      userId: data.userId,
      contactListId: data.contactListId,
      name: data.name,
      warmupMessage: data.warmupMessage,
      templateMessage: data.templateMessage,
      categoryFilter: data.categoryFilter ?? null,
      status: 'DRAFT',
    })

    let recipientCount: number
    if (data.categoryFilter) {
      const cats = data.categoryFilter.split(',').map((s) => s.trim())
      const counts = await Promise.all(
        cats.map((cat) => this.contactListRepository.countContactsByCategory(data.contactListId, cat)),
      )
      recipientCount = counts.reduce((a, b) => a + b, 0)
    } else {
      recipientCount = await this.contactListRepository.countContacts(data.contactListId)
    }

    return { broadcast, recipientCount }
  }
}
