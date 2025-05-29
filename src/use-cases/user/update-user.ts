import { Plan, Role, User } from '@prisma/client'
import { hash } from 'bcrypt'
import { UserRepository } from '@/repositories/user'
import { ResourceNotFound } from '@/error/resource-not-found'
import { UserAlreadyExistsError } from '@/error/user-already-exists-error'

interface UpdateUserUseCaseRequest {
  id: string
  email?: string
  phoneNumber: string
  password?: string
  role: Role
  plan: Plan
  isActive: boolean
  domain?: string
}

interface UpdateUserUseCaseResponse {
  user: User
}

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    password,
    role,
    plan,
    isActive,
    id,
    phoneNumber,
    email,
    domain,
  }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(id)

    if (!findedUser) {
      throw new ResourceNotFound()
    }

    if (email && email !== findedUser.email) {
      const userWithSameUsername =
        await this.userRepository.findUserByEmail(email)
      if (userWithSameUsername) {
        throw new UserAlreadyExistsError()
      }
    }

    let hashedPassword = ''
    if (password) {
      hashedPassword = await hash(password, 6)
    } else {
      hashedPassword = findedUser.passwordHash
    }

    const user = await this.userRepository.update({
      id,
      phoneNumber,
      email: email || findedUser.email,
      Role: role,
      Plan: plan,
      passwordHash: hashedPassword,
      isActive,
      domain,
    })

    return { user }
  }
}
