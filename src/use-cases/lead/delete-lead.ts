import { Lead } from '@prisma/client'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { CompanyRepository } from '@/repositories/company'

interface DeleteLeadUseCaseRequest {
  userId: string
  leadId: string
}

interface DeleteLeadUseCaseResponse {
  lead: Lead | null
}

export class DeleteLeadUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private companyRepository: CompanyRepository,
  ) {}

  async execute({
    userId,
    leadId,
  }: DeleteLeadUseCaseRequest): Promise<DeleteLeadUseCaseResponse> {
    const findedCompany =
      await this.companyRepository.listCompaniesByUserId(userId)

    if (!findedCompany) {
      throw new ResourceNotFound()
    }

    const foundLead = await this.leadRepository.findLeadById(leadId)

    if (!foundLead) {
      throw new ResourceNotFound()
    }

    if (foundLead.companyId !== findedCompany[0].id) {
      throw new InvalidCredentialsError()
    }

    const deletedLead = await this.leadRepository.delete(leadId)

    return { lead: deletedLead }
  }
}
