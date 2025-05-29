import { House, Lead } from '@prisma/client'

import { CompanyRepository } from '@/repositories/company'
import { ResourceNotFound } from '../../error/resource-not-found'
import { UserNotFound } from '../../error/user-not-found'
import { UserRepository } from '@/repositories/user'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'
import { LeadRepository } from '@/repositories/lead'

interface ListHouseOptionsUseCaseRequest {
  userId: string
}

type HouseOption = {
  value: string
  label: string
}

export interface LeadWithHouse extends Lead {
  House: House
}

interface ListHouseOptionsUseCaseResponse {
  HouseOptions: HouseOption[] | []
}

export class ListHouseOptionsUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private companyRepository: CompanyRepository,
    private userRepository: UserRepository,
  ) { }

  async execute({
    userId,
  }: ListHouseOptionsUseCaseRequest): Promise<ListHouseOptionsUseCaseResponse> {
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

    const leads = await this.leadRepository.findManyByCompanyId(
      findedCompany[0].id,
    )

    const HouseOptions = leads.reduce(
      (options: HouseOption[], lead: LeadWithHouse) => {
        const houseId = lead.House?.id ?? ''
        if (!houseId || options.some((option) => option.value === houseId)) {
          return options
        }
        return [...options, { label: lead.House!.title, value: houseId }]
      },
      [],
    )

    return {
      HouseOptions,
    }
  }
}
