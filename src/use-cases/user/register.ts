import { Plan, Prisma, Role } from '@prisma/client'
import { hash } from 'bcrypt'
import { UserAlreadyExistsError } from '../../error/user-already-exists-error'
import { UserRepository } from '@/repositories/user'
import { TransactionProvider } from '@/helpers/transaction-provider'
import { v4 as uuid } from 'uuid'
import { CompanyRepository } from '@/repositories/company'

interface RegisterUserUseCaseRequest {
  email: string
  phoneNumber?: string
  password: string
  role: Role
  isActive: boolean
  domain: string
  plan: Plan
}

interface User {
  id: string
  email: string
  phoneNumber?: string
  isActive: boolean
  createdAt: Date
  domain: string
  Role: Role
  Plan: Plan
}

interface RegisterUserUseCaseResponse {
  user: User
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private companyRepository: CompanyRepository,
    private transactionProvider: TransactionProvider,
  ) { }

  async execute({
    email,
    phoneNumber,
    password,
    role,
    isActive,
    domain,
    plan,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const userWithSameUsername =
      await this.userRepository.findUserByEmail(email)

    if (userWithSameUsername) {
      throw new UserAlreadyExistsError()
    }

    const hashedPassword = await hash(password, 6)
    const newUserId = uuid()
    const newCompanyId = uuid()
    const newDate = new Date()

    await this.transactionProvider.runTransaction(async () => {
      await this.userRepository.create({
        email,
        phoneNumber,
        passwordHash: hashedPassword,
        Role: role,
        Plan: plan,
        isActive,
        domain,
        id: newUserId,
      })
      await this.companyRepository.create({
        name: '',
        email: '',
        phoneNumber: '',
        whatsappNumber: '',
        document: '',
        creci: '',
        userId: newUserId,
        cep: '',
        city: '',
        complement: '',
        neighbour: '',
        number: '',
        street: '',
        uf: '',
        id: newCompanyId,
      })
    }, Prisma.TransactionIsolationLevel.Serializable)

    const user = {
      email,
      phoneNumber,
      Role: role,
      isActive,
      id: newUserId,
      createdAt: newDate,
      Plan: plan,
      domain,
    }

    return { user }
  }
}
