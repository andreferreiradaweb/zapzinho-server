import { Lead, LeadOption, LeadStatus } from '@/lib/prisma'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { ProductRepository } from '@/repositories/product'
import { env } from '@/config/validatedEnv'
import { notifyLeadToN8N } from '@/services/notifyLeadN8N'
import { UserRepository } from '@/repositories/user'

interface CreateLeadForAutomationUseCaseRequest {
  nome: string
  email: string
  telefone: string
  message: string
  Status: LeadStatus
  Option: LeadOption
  userId: string
  productId: string
}

interface CreateLeadForAutomationUseCaseResponse {
  lead: Lead
}

export class CreateLeadForAutomationUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private productRepository: ProductRepository,
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

    const findedProduct = await this.productRepository.findProductById(productId || '')

    notifyLeadToN8N({
      leadName: nome,
      leadPhone: telefone,
      leadMessage: message,
      phoneNumber: findedUser.phoneNumber || '',
      interest: findedProduct?.title ?? '',
      webhookUrl: env.N8N_WEBHOOK_LEAD_NOTIFY,
    })

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
