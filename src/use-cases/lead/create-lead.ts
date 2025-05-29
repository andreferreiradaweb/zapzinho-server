import { Lead, LeadStatus } from '@prisma/client'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { CompanyRepository } from '@/repositories/company'
import { WaitAMoment } from '@/error/wait-a-moment'
import NodeCache from 'node-cache'
import { ProductRepository } from '@/repositories/product'
import { env } from '@/config/validatedEnv'
import { notifyLeadToN8N } from '@/services/notifyLeadN8N'

const cache = new NodeCache()

interface CreateLeadUseCaseRequest {
  nome: string
  email: string
  telefone: string
  message: string
  Status: LeadStatus
  userId: string
  productId?: string
  ip: string
}

interface CreateLeadUseCaseResponse {
  lead: Lead
}

export class CreateLeadUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private companyRepository: CompanyRepository,
    private productRepository: ProductRepository
  ) { }

  async execute({
    nome,
    email,
    telefone,
    message,
    Status,
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

    const findedCompany =
      await this.companyRepository.listCompaniesByUserId(userId)
    if (!findedCompany) {
      throw new ResourceNotFound()
    }

    const findedProduct = await this.productRepository.findProductById(productId || '')

    notifyLeadToN8N({
      leadName: nome,
      leadPhone: telefone,
      leadMessage: message,
      companyZapNumber: findedCompany[0].whatsappNumber || '',
      interest: findedProduct?.title ?? '',
      webhookUrl: env.N8N_WEBHOOK_LEAD_NOTIFY,
    })

    const lead = await this.leadRepository.create({
      nome,
      email,
      telefone,
      message,
      Status,
      productId,
      companyId: findedCompany[0].id,
    })

    return { lead }
  }
}
