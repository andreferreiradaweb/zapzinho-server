import { Lead, LeadStatus } from '@/lib/prisma'
import { LeadRepository, LeadItemInput } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { UserRepository } from '@/repositories/user'
import { UserAlreadyExistsError } from '@/error/user-already-exists-error'

interface CreateLeadUseCaseRequest {
  nome: string
  email?: string
  telefone: string
  message: string
  Status: LeadStatus
  userId: string
  id?: string
  createdAt?: Date
  productId?: string
  categoryId?: string
  items?: LeadItemInput[]
}

interface CreateLeadUseCaseResponse {
  lead: Lead
}

export class CreateLeadUseCase {
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
    categoryId,
    items,
  }: CreateLeadUseCaseRequest): Promise<CreateLeadUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)
    if (!findedUser) {
      throw new ResourceNotFound()
    }

    const phoneDigits = telefone.replace(/\D/g, '')
    const existing = await this.leadRepository.findLeadWhereUserByNumber(userId, phoneDigits)
    if (existing) {
      throw new UserAlreadyExistsError()
    }

    const primaryProductId = items && items.length > 0 ? items[0].productId : productId

    const lead = await this.leadRepository.create({
      nome,
      email,
      telefone,
      message,
      Status,
      userId: findedUser.id,
      id,
      createdAt,
      productId: primaryProductId,
      categoryId,
    })

    if (items && items.length > 0) {
      await this.leadRepository.setItems(lead.id, items)
    }

    return { lead }
  }
}
