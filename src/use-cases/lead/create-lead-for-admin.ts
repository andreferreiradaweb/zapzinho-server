import { Lead, LeadStatus } from '@prisma/client'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { CompanyRepository } from '@/repositories/company'

interface CreateLeadUseCaseRequest {
  nome: string
  email: string
  telefone: string
  message: string
  Status: LeadStatus
  userId: string
  id?: string
  createdAt?: Date
}

interface CreateLeadUseCaseResponse {
  lead: Lead
}

export class CreateLeadForAdminUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private companyRepository: CompanyRepository,
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
  }: CreateLeadUseCaseRequest): Promise<CreateLeadUseCaseResponse> {
    const findedCompany =
      await this.companyRepository.listCompaniesByUserId(userId)
    if (!findedCompany) {
      throw new ResourceNotFound()
    }

    const lead = await this.leadRepository.create({
      nome,
      email,
      telefone,
      message,
      Status,
      companyId: findedCompany[0].id,
      id,
      createdAt,
    })

    return { lead }
  }
}
