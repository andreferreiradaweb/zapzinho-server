import { Lead } from '@/lib/prisma'
import { UserRepository } from '@/repositories/user'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '@/error/resource-not-found'
import { v4 as uuid } from 'uuid'

interface HandleIncomingMessageRequest {
  instanceId: string
  phone: string        // digits only, e.g. 5511999999999
  name: string
  message: string
}

interface HandleIncomingMessageResponse {
  lead: Lead
  created: boolean     // true = novo lead, false = já existia
}

export class HandleIncomingMessageUseCase {
  constructor(
    private userRepository: UserRepository,
    private leadRepository: LeadRepository,
  ) {}

  async execute({
    instanceId,
    phone,
    name,
    message,
  }: HandleIncomingMessageRequest): Promise<HandleIncomingMessageResponse> {
    const user = await this.userRepository.findUserByInstanceId(instanceId)
    if (!user) throw new ResourceNotFound()

    const existing = await this.leadRepository.findLeadWhereUserByNumber(user.id, phone)
    if (existing) {
      const updated = await this.leadRepository.update({
        id: existing.id,
        lastClientMessageAt: new Date(),
      })
      return { lead: updated, created: false }
    }

    const lead = await this.leadRepository.create({
      id: uuid(),
      userId: user.id,
      nome: name || phone,
      telefone: phone,
      email: null,
      message,
      Status: 'NOVO_INTERESSE',
      Option: 'ATENDIMENTO_HUMANO',
      productId: null,
      lastClientMessageAt: new Date(),
    })

    return { lead, created: true }
  }
}
