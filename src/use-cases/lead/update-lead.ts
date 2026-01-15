import { Lead, LeadOption, LeadStatus } from '@/lib/prisma'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { UserRepository } from '@/repositories/user'

interface UpdateLeadUseCaseRequest {
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

interface UpdateLeadUseCaseResponse {
  lead: Lead
}

export class UpdateLeadUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private userRepository: UserRepository,
  ) { }

  async execute({
    id,
    userId,
    nome,
    email,
    telefone,
    productId,
    Status,
    message,
    Option
  }: UpdateLeadUseCaseRequest): Promise<UpdateLeadUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new ResourceNotFound()
    }

    const foundLead = await this.leadRepository.findLeadById(id)

    if (!foundLead) {
      throw new ResourceNotFound()
    }

    if (foundLead.userId !== findedUser.id) {
      throw new InvalidCredentialsError()
    }

    const updatedLead = await this.leadRepository.update({
      id,
      nome,
      email,
      telefone,
      productId,
      Status,
      createdAt: new Date(),
      message,
      Option
    })

    return { lead: updatedLead }
  }
}
