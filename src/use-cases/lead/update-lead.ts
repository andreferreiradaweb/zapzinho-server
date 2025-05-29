import { Lead, LeadStatus } from '@prisma/client'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { CompanyRepository } from '@/repositories/company'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

interface UpdateLeadUseCaseRequest {
  id: string
  Status: LeadStatus
  userId: string
  nome?: string
  email?: string
  telefone?: string
  productId: string | null
  message?: string
}

interface UpdateLeadUseCaseResponse {
  lead: Lead
}

export class UpdateLeadUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private companyRepository: CompanyRepository,
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
  }: UpdateLeadUseCaseRequest): Promise<UpdateLeadUseCaseResponse> {
    const findedCompany =
      await this.companyRepository.listCompaniesByUserId(userId)

    if (!findedCompany) {
      throw new ResourceNotFound()
    }

    const foundLead = await this.leadRepository.findLeadById(id)

    if (!foundLead) {
      throw new ResourceNotFound()
    }

    if (foundLead.companyId !== findedCompany[0].id) {
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
    })

    return { lead: updatedLead }
  }
}
