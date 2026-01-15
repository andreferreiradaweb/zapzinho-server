import { Lead, LeadOption, LeadStatus } from '@/lib/prisma'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { UserRepository } from '@/repositories/user'

interface CreateLeadUseCaseRequest {
  nome: string
  email: string
  telefone: string
  message: string
  Status: LeadStatus
  Option: LeadOption
  userId: string
  id?: string
  createdAt?: Date
  productId: string
}

interface CreateLeadUseCaseResponse {
  lead: Lead
}

export class CreateLeadForAdminUseCase {
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
    userId,
    id,
    createdAt,
    productId,
    Option
  }: CreateLeadUseCaseRequest): Promise<CreateLeadUseCaseResponse> {
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
      userId: findedUser.id,
      id,
      createdAt,
      productId,
      Option
    })

    return { lead }
  }
}
