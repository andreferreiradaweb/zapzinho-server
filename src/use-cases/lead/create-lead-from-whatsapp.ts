import { Lead } from '@/lib/prisma'
import { LeadRepository } from '@/repositories/lead'
import { UserRepository } from '@/repositories/user'
import { ResourceNotFound } from '@/error/resource-not-found'

interface Request {
  userId: string
  telefone: string
  nome: string
}

interface Response {
  lead: Lead
  created: boolean
}

export class CreateLeadFromWhatsappUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({ userId, telefone, nome }: Request): Promise<Response> {
    const user = await this.userRepository.findUserById(userId)
    if (!user) throw new ResourceNotFound()

    const phone = telefone.replace(/\D/g, '')

    const { lead, created } = await this.leadRepository.upsertByPhone({
      userId,
      phone,
      name: nome,
      message: 'Lead capturado via landing page',
    })

    return { lead, created }
  }
}
