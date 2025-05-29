import { LeadStatus } from '@prisma/client'

import { CompanyRepository } from '@/repositories/company'
import { ResourceNotFound } from '../../error/resource-not-found'
import { UserNotFound } from '../../error/user-not-found'
import { UserRepository } from '@/repositories/user'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { LeadRepository } from '@/repositories/lead'

interface ListLeadsUseCaseRequest {
    userId: string
    status?: LeadStatus
    startDate?: string
    endDate?: string
}

interface ListLeadsUseCaseResponse {
    totalItems: number
}

export class ListLeadsUseCase {
    constructor(
        private leadRepository: LeadRepository,
        private companyRepository: CompanyRepository,
        private userRepository: UserRepository,
    ) { }

    async execute({
        userId,
        status,
        startDate,
        endDate,
    }: ListLeadsUseCaseRequest): Promise<ListLeadsUseCaseResponse> {
        const findedUser = await this.userRepository.findUserById(userId)

        if (!findedUser) {
            throw new UserNotFound()
        }

        const findedCompany =
            await this.companyRepository.listCompaniesByUserId(userId)

        if (!findedCompany) {
            throw new ResourceNotFound()
        }

        if (findedCompany[0].userId !== userId) {
            throw new InvalidCredentialsError()
        }

        const totalItems = await this.leadRepository.countByCompanyId(
            findedCompany[0].id,
            '',
            status,
            startDate,
            endDate,
        )

        return {
            totalItems,
        }
    }
}
