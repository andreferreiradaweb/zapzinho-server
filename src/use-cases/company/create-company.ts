import { Company } from '@prisma/client'

import { CompanyRepository } from '@/repositories/company'
import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { v4 as uuid } from 'uuid'

interface CreateCompanyUseCaseRequest {
  name: string
  email: string
  phoneNumber: string
  whatsappNumber: string
  document: string | null
  creci?: string
  userId: string
  cep: string
  city: string
  complement: string
  neighbour: string
  number: string
  street: string
  uf: string
}

interface CreateCompanyUseCaseResponse {
  company: Company
}

export class CreateCompanyUseCase {
  constructor(
    private userRepository: UserRepository,
    private companyRepository: CompanyRepository,
  ) { }

  async execute({
    name,
    email,
    phoneNumber,
    whatsappNumber,
    document,
    creci,
    userId,
    cep,
    city,
    complement,
    neighbour,
    number,
    street,
    uf,
  }: CreateCompanyUseCaseRequest): Promise<CreateCompanyUseCaseResponse> {
    const user = await this.userRepository.findUserById(userId)

    if (!user) {
      throw new UserNotFound()
    }

    const newId = uuid()
    const newDate = new Date()

    const company = await this.companyRepository.create({
      name,
      email,
      phoneNumber,
      whatsappNumber,
      document,
      creci,
      userId,
      id: newId,
      createdAt: newDate,
      cep,
      city,
      complement,
      neighbour,
      number,
      street,
      uf,
    })

    return { company }
  }
}
