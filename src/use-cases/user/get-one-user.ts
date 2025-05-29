import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'
import { Plan, Role } from '@prisma/client'

interface GetOneUserUseCaseRequest {
  userId: string
}

type User = {
  id: string
  email: string
  phoneNumber: string | null
  isActive: boolean
  domain: string | null
  Role: Role
  Plan: Plan
  createdAt: Date
}

interface GetOneUserUseCaseResponse {
  user: User | null
}

export class GetOneUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
  }: GetOneUserUseCaseRequest): Promise<GetOneUserUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(userId)

    if (!findedUser) {
      throw new UserNotFound()
    }

    const newUser = {
      id: findedUser.id,
      Plan: findedUser.Plan,
      Role: findedUser.Role,
      createdAt: findedUser.createdAt,
      email: findedUser.email,
      isActive: findedUser.isActive,
      phoneNumber: findedUser.phoneNumber,
      domain: findedUser.domain || '',
    }

    return { user: newUser }
  }
}
