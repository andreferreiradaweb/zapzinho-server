import { Lead, LeadType, LeadStatus } from '@prisma/client'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { CompanyRepository } from '@/repositories/company'
import { WaitAMoment } from '@/error/wait-a-moment'
import NodeCache from 'node-cache'
import { HouseRepository } from '@/repositories/product'
import { env } from '@/config/validatedEnv'
import { notifyLeadToN8N } from '@/services/notifyLeadN8N'

const cache = new NodeCache()

interface CreateLeadUseCaseRequest {
  nome: string
  email: string
  telefone: string
  message: string
  Status: LeadStatus
  Type: LeadType
  userId: string
  houseId?: string
  ip: string
}

interface CreateLeadUseCaseResponse {
  lead: Lead
}

export class CreateLeadUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private companyRepository: CompanyRepository,
    private houseRepository: HouseRepository
  ) { }

  async execute({
    nome,
    email,
    telefone,
    message,
    Status,
    Type,
    houseId,
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

    const findedHouse = await this.houseRepository.findHouseById(houseId || '')

    notifyLeadToN8N({
      leadName: nome,
      leadPhone: telefone,
      leadMessage: message,
      companyZapNumber: findedCompany[0].whatsappNumber || '',
      interest: findedHouse?.title ?? Type,
      webhookUrl: env.N8N_WEBHOOK_LEAD_NOTIFY,
    })

    const lead = await this.leadRepository.create({
      nome,
      email,
      telefone,
      message,
      Status,
      Type,
      houseId,
      companyId: findedCompany[0].id,
    })

    return { lead }
  }
}
