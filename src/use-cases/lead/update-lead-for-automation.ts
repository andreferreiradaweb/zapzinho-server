import { Lead, LeadOption, LeadStatus } from '@/lib/prisma'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import NodeCache from 'node-cache'
import { UserRepository } from '@/repositories/user'

const cache = new NodeCache()

interface CreateLeadForLpUseCaseRequest {
  id: string
  Status: LeadStatus
  Option: LeadOption
  userId: string
  nome?: string
  email?: string
  telefone?: string
  productId?: string
  message?: string
}

interface CreateLeadForLpUseCaseResponse {
  lead: Lead
}

export class CreateLeadForLpUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private userRepository: UserRepository,
  ) { }

  async execute({
    nome,
    email,
    telefone,
    message,
    Status,
    Option,
    productId,
    userId,
  }: CreateLeadForLpUseCaseRequest): Promise<CreateLeadForLpUseCaseResponse> {
    const findedUser =
      await this.userRepository.findUserById(userId)
    if (!findedUser) {
      throw new ResourceNotFound()
    }

    const lead = await this.leadRepository.update({
      nome,
      email,
      telefone,
      message,
      Status,
      Option,
      productId,
      userId: findedUser.id,
    })

    return { lead }
  }
}
