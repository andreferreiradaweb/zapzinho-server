import { Lead, LeadStatus } from '@/lib/prisma'
import { LeadRepository, LeadItemInput } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { UserRepository } from '@/repositories/user'

interface UpdateLeadUseCaseRequest {
  id: string
  Status: LeadStatus
  userId: string
  nome?: string
  email?: string | null
  telefone?: string
  productId?: string
  categoryId?: string
  message?: string
  sellerNote?: string | null
  items?: LeadItemInput[]
  deliveryDate?: string | null
  delivered?: boolean
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
    categoryId,
    Status,
    message,
    sellerNote,
    items,
    deliveryDate,
    delivered,
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

    const primaryProductId =
      items !== undefined
        ? items.length > 0 ? items[0].productId : null
        : productId

    const updatedLead = await this.leadRepository.update({
      id,
      nome,
      email,
      telefone,
      productId: primaryProductId,
      categoryId,
      Status,
      createdAt: new Date(),
      message,
      sellerNote,
      deliveryDate: deliveryDate !== undefined ? (deliveryDate ? new Date(deliveryDate) : null) : undefined,
      delivered,
    })

    if (items !== undefined) {
      await this.leadRepository.setItems(id, items)
    }

    return { lead: updatedLead }
  }
}
