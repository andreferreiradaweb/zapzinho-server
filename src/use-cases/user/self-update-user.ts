import { hash, compare } from 'bcrypt'
import { UserRepository } from '@/repositories/user'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { User } from '@/lib/prisma'

interface SelfUpdateUserUseCaseRequest {
  id: string
  phoneNumber?: string
  password?: string
  newPassword?: string
}

interface SelfUpdateUserUseCaseResponse {
  user: Omit<User, 'id' | 'passwordHash'>
}

export class SelfUpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    password,
    newPassword,
    id,
    phoneNumber,
  }: SelfUpdateUserUseCaseRequest): Promise<SelfUpdateUserUseCaseResponse> {
    const findedUser = await this.userRepository.findUserById(id)

    if (!findedUser) {
      throw new ResourceNotFound()
    }

    if (id !== findedUser.id) {
      throw new InvalidCredentialsError()
    }

    if (password) {
      const doesPasswordMatches = await compare(
        password,
        findedUser.passwordHash,
      )

      if (!doesPasswordMatches) {
        throw new InvalidCredentialsError()
      }
    }

    let hashedPassword = ''
    if (newPassword) {
      hashedPassword = await hash(newPassword, 6)
    } else {
      hashedPassword = findedUser.passwordHash
    }

    const { Role, createdAt, email, isActive, CustomerType, trialExpiresAt, onboardingMessageSentAt, wapiInstanceId } =
      await this.userRepository.update({
        id,
        phoneNumber,
        email: findedUser.email,
        Role: findedUser.Role,
        passwordHash: hashedPassword,
        isActive: findedUser.isActive,
        CustomerType: findedUser.CustomerType,
        wapiInstanceId: findedUser.wapiInstanceId,
      })

    const newUser = {
      phoneNumber: phoneNumber || findedUser.phoneNumber,
      Role,
      Plan: findedUser.Plan,
      createdAt,
      email,
      isActive,
      CustomerType,
      trialExpiresAt,
      onboardingMessageSentAt,
      wapiInstanceId,
      wapiToken: findedUser.wapiToken,
      prospectingInstanceId: findedUser.prospectingInstanceId,
      prospectingToken: findedUser.prospectingToken,
      name: findedUser.name,
      address: findedUser.address,
      emailVerified: findedUser.emailVerified,
    }

    return { user: newUser }
  }
}
