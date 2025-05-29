import { Prisma } from '@prisma/client'
import { CompanyRepository } from '@/repositories/company'
import { ResourceNotFound } from '../../error/resource-not-found'
import { InvalidCredentialsError } from '../../error/invalid-credentials-error'

interface UpdateCompanyUseCaseRequest {
  name: string
  email: string
  phoneNumber: string
  whatsappNumber: string
  document: string
  creci?: string
  id: string
  userId: string
  cep: string
  city: string
  complement: string
  neighbour: string
  number: string
  street: string
  uf: string
}

interface UpdateCompanyUseCaseResponse {
  company: Prisma.CompanyUncheckedUpdateInput
}

export class UpdateCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) { }

  async execute({
    name,
    email,
    phoneNumber,
    whatsappNumber,
    document,
    creci,
    id,
    userId,
    cep,
    city,
    complement,
    neighbour,
    number,
    street,
    uf,
  }: UpdateCompanyUseCaseRequest): Promise<UpdateCompanyUseCaseResponse> {
    const findedCompany = await this.companyRepository.findCompanyById(id)

    if (!findedCompany) {
      throw new ResourceNotFound()
    }

    if (findedCompany.userId !== userId) {
      throw new InvalidCredentialsError()
    }

    const company = await this.companyRepository.update({
      name,
      email,
      phoneNumber,
      whatsappNumber,
      document,
      creci,
      id,
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
