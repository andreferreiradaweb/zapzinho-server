import { Lead, LeadOption, LeadStatus } from '@/lib/prisma'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { WaitAMoment } from '@/error/wait-a-moment'
import NodeCache from 'node-cache'
import { ProductRepository } from '@/repositories/product'
import { env } from '@/config/validatedEnv'
import { notifyLeadToN8N } from '@/services/notifyLeadN8N'
import { UserRepository } from '@/repositories/user'

const cache = new NodeCache()

interface CreateLeadUseCaseRequest {
  nome: string
  email: string
  telefone: string
  message: string
  Status: LeadStatus
  Option: LeadOption
  userId: string
  productId: string
  ip: string
}

interface CreateLeadUseCaseResponse {
  lead: Lead
}

export class CreateLeadUseCase {
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
    ip,
  }: CreateLeadUseCaseRequest): Promise<CreateLeadUseCaseResponse> {
    const cachedIp = cache.get(ip) as string
    const cachedEmail = cache.get(email) as string

    if (cachedEmail === email || cachedIp === ip) {
      throw new WaitAMoment()
    }

    cache.set(ip, ip, 30)
    cache.set(email, email, 30)

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
