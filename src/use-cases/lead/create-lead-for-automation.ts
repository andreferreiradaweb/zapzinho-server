import { Lead, LeadOption, LeadStatus } from '@/lib/prisma'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { UserRepository } from '@/repositories/user'

interface CreateLeadForAutomationUseCaseRequest {
  nome: string
  email?: string
  telefone: string
  message: string
  Status: LeadStatus
  Option: LeadOption
  userId: string
  productId?: string
}

interface CreateLeadForAutomationUseCaseResponse {
  lead: Lead
}

export class CreateLeadForAutomationUseCase {
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
  }: CreateLeadForAutomationUseCaseRequest): Promise<CreateLeadForAutomationUseCaseResponse> {
    const findedUser =
      await this.userRepository.findUserById(userId)
    if (!findedUser) {
      throw new ResourceNotFound()
    }

    const lead = await this.leadRepository.create({
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
