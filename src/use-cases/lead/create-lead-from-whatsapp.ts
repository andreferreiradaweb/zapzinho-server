import { Lead } from '@/lib/prisma'
import { LeadRepository } from '@/repositories/lead'
import { UserRepository } from '@/repositories/user'
import { ResourceNotFound } from '@/error/resource-not-found'

interface Request {
  storePhone: string
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

  async execute({ storePhone, telefone, nome }: Request): Promise<Response> {
    const user = await this.userRepository.findUserByPhone(storePhone)
    if (!user) throw new ResourceNotFound()

    const phone = telefone.replace(/\D/g, '')

    const { lead, created } = await this.leadRepository.upsertByPhone({
      userId: user.id,
      phone,
      name: nome,
      message: 'Lead capturado via landing page',
    })

    return { lead, created }
  }
}
