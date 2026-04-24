import { hash, compare } from 'bcrypt'
import { UserRepository } from '@/repositories/user'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { User } from '@/lib/prisma'

interface SelfUpdateUserUseCaseRequest {
  id: string
  phoneNumber?: string | null
  password?: string
  newPassword?: string
  name?: string
  prospectingInstanceId?: string | null
  prospectingToken?: string | null
  msgVar1?: string | null
  msgVar2?: string | null
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
    name,
    prospectingInstanceId,
    prospectingToken,
    msgVar1,
    msgVar2,
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

    const { Role, createdAt, email, isActive, CustomerType, trialExpiresAt, onboardingMessageSentAt, wapiInstanceId, prospectingInstanceId: updatedProspectingInstanceId, prospectingToken: updatedProspectingToken, name: updatedName, Plan, address, emailVerified, wapiToken, msgVar1: updatedLpPhoneParam, msgVar2: updatedLpNameParam } =
      await this.userRepository.update({
        id,
        phoneNumber: phoneNumber || findedUser.phoneNumber,
        name: name !== undefined ? name : findedUser.name,
        email: findedUser.email,
        Role: findedUser.Role,
        passwordHash: hashedPassword,
        isActive: findedUser.isActive,
        CustomerType: findedUser.CustomerType,
        wapiInstanceId: findedUser.wapiInstanceId,
        prospectingInstanceId:
          prospectingInstanceId !== undefined
            ? prospectingInstanceId
            : findedUser.prospectingInstanceId,
        prospectingToken:
          prospectingToken !== undefined
            ? prospectingToken
            : findedUser.prospectingToken,
        msgVar1:
          msgVar1 !== undefined ? msgVar1 : findedUser.msgVar1,
        msgVar2:
          msgVar2 !== undefined ? msgVar2 : findedUser.msgVar2,
      })

    const newUser = {
      phoneNumber: phoneNumber || findedUser.phoneNumber,
      Role,
      Plan,
      createdAt,
      email,
      isActive,
      CustomerType,
      trialExpiresAt,
      onboardingMessageSentAt,
      wapiInstanceId,
      wapiToken,
      prospectingInstanceId: updatedProspectingInstanceId,
      prospectingToken: updatedProspectingToken,
      msgVar1: updatedLpPhoneParam,
      msgVar2: updatedLpNameParam,
      name: updatedName,
      address,
      emailVerified,
    }

    return { user: newUser }
  }
}
