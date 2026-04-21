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
      status: 'DRAFT',
    })

    const recipientCount = await this.contactListRepository.countContacts(data.contactListId)

    return { broadcast, recipientCount }
  }
}
