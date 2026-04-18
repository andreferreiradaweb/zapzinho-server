import { LeadStatus } from '@/lib/prisma'
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
            throw new InvalidCredentialsError()
        }

        const totalItems = await this.leadRepository.countByUserId(
            findedUser.id,
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
