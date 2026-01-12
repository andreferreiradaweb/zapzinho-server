import { CustomerType, Role, User } from '@/lib/prisma'
import { hash } from 'bcrypt'
import { UserAlreadyExistsError } from '../../error/user-already-exists-error'
import { UserRepository } from '@/repositories/user'
import { v4 as uuid } from 'uuid'

interface RegisterUserUseCaseRequest {
  email: string
  phoneNumber?: string
  password: string
  role: Role
  isActive: boolean
  customerType?: CustomerType
}

interface RegisterUserUseCaseResponse {
  user: Omit<User, 'passwordHash'>
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
  ) { }

  async execute({
    email,
    phoneNumber,
    password,
    role,
    isActive,
    customerType,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const userWithSameUsername =
      await this.userRepository.findUserByEmail(email)

    if (userWithSameUsername) {
      throw new UserAlreadyExistsError()
    }

    const hashedPassword = await hash(password, 6)
    const newUserId = uuid()
    const newDate = new Date()

    await this.userRepository.create({
      email,
      phoneNumber,
      passwordHash: hashedPassword,
      Role: role,
      isActive,
      id: newUserId,
      CustomerType: customerType ?? CustomerType.B2C,
    })

    const user: Omit<User, 'passwordHash'> = {
      email,
      phoneNumber: phoneNumber ?? null,
      Role: role,
      isActive,
      id: newUserId,
      createdAt: newDate,
      CustomerType: customerType ?? CustomerType.B2C,
    }

    return { user }
  }
}
