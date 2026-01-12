import { Lead } from '@/lib/prisma'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '../../error/resource-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { UserRepository } from '@/repositories/user'

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
    private userRepository: UserRepository,
  ) {}

  async execute({
    userId,
    leadId,
  }: DeleteLeadUseCaseRequest): Promise<DeleteLeadUseCaseResponse> {
    const findedUser =
      await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new InvalidCredentialsError()
    }

    const foundLead = await this.leadRepository.findLeadById(leadId)

    if (!foundLead) {
      throw new ResourceNotFound()
    }

    if (foundLead.userId !== findedUser.id) {
      throw new InvalidCredentialsError()
    }

    const deletedLead = await this.leadRepository.delete(leadId)

    return { lead: deletedLead }
  }
}
