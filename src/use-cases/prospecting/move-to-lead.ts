import { Lead } from '@/lib/prisma'
import { ContactListRepository } from '@/repositories/prospecting'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { v4 as uuid } from 'uuid'

export class MoveToLeadUseCase {
  constructor(
    private contactListRepository: ContactListRepository,
    private leadRepository: LeadRepository,
  ) {}

  async execute(contactId: string, userId: string): Promise<Lead> {
    const contact = await this.contactListRepository.getContact(contactId)
    if (!contact) throw new ResourceNotFound()

    const list = await this.contactListRepository.findById(contact.contactListId)
    if (!list || list.userId !== userId) throw new InvalidCredentialsError()

    if (contact.convertedLeadId) {
      const existing = await this.leadRepository.findLeadById(contact.convertedLeadId)
      if (existing) return existing
    }

    const lead = await this.leadRepository.create({
      id: uuid(),
      userId,
      nome: contact.name,
      telefone: contact.phone,
      email: contact.email ?? null,
      message: null,
      Status: 'NOVO_INTERESSE',
      productId: null,
      lastClientMessageAt: null,
    })

    await this.contactListRepository.updateContactStatus(contactId, 'CONVERTED', {
      convertedLeadId: lead.id,
    })

    return lead
  }
}
