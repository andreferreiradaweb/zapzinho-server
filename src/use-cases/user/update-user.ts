import { CustomerType, Role, User, UserPlan } from '@/lib/prisma'
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
  plan?: UserPlan
  isActive: boolean
  customerType?: CustomerType
  name?: string
  address?: string
  wapiInstanceId?: string | null
  wapiToken?: string | null
  prospectingInstanceId?: string | null
  prospectingToken?: string | null
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
    customerType,
    name,
    address,
    wapiInstanceId,
    wapiToken,
    prospectingInstanceId,
    prospectingToken,
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
      passwordHash: hashedPassword,
      isActive,
      CustomerType: customerType || findedUser.CustomerType,
      name: name ?? findedUser.name,
      address: address ?? findedUser.address,
      Plan: plan ?? findedUser.Plan,
      wapiInstanceId: wapiInstanceId !== undefined ? wapiInstanceId : findedUser.wapiInstanceId,
      wapiToken: wapiToken !== undefined ? wapiToken : findedUser.wapiToken,
      prospectingInstanceId: prospectingInstanceId !== undefined ? prospectingInstanceId : findedUser.prospectingInstanceId,
      prospectingToken: prospectingToken !== undefined ? prospectingToken : findedUser.prospectingToken,
    })

    return { user }
  }
}
