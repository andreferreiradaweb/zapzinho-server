import { Lead } from '@/lib/prisma'
import { UserRepository } from '@/repositories/user'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '@/error/resource-not-found'
import { Prisma } from '@/lib/prisma'
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
    private adminInstanceId: string,
  ) {}

  async execute({
    instanceId,
    phone,
    name,
    message,
  }: HandleIncomingMessageRequest): Promise<HandleIncomingMessageResponse> {
    let user = await this.userRepository.findUserByInstanceId(instanceId)

    if (!user && instanceId === this.adminInstanceId) {
      user = await this.userRepository.findAdminUser()
    }

    if (!user) throw new ResourceNotFound()

    try {
      const { lead, created } = await this.leadRepository.upsertByPhone({
        userId: user.id,
        phone,
        name: name || phone,
        message,
      })
      return { lead, created }
    } catch (err) {
      // Fallback for unique constraint race: find the already-created lead
      if (err instanceof Prisma.PrismaClientKnownRequestError && (err as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
        const existing = await this.leadRepository.findLeadWhereUserByNumber(user.id, phone)
        if (existing) {
          const updated = await this.leadRepository.update({
            id: existing.id,
            lastClientMessageAt: new Date(),
          })
          return { lead: updated, created: false }
        }
      }
      throw err
    }
  }
}
