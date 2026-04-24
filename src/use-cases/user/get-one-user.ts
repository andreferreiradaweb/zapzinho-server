import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '../../error/user-not-found'

interface GetOneUserUseCaseRequest {
  userId: string
}

interface GetOneUserUseCaseResponse {
  user: object | null
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
      Role: findedUser.Role,
      Plan: findedUser.Plan,
      createdAt: findedUser.createdAt,
      email: findedUser.email,
      isActive: findedUser.isActive,
      phoneNumber: findedUser.phoneNumber,
      name: findedUser.name,
      address: findedUser.address,
      wapiInstanceId: findedUser.wapiInstanceId,
      wapiToken: findedUser.wapiToken,
      prospectingInstanceId: findedUser.prospectingInstanceId,
      prospectingToken: findedUser.prospectingToken,
      lpPhoneParam: findedUser.lpPhoneParam,
      lpNameParam: findedUser.lpNameParam,
      emailVerified: findedUser.emailVerified,
    }

    return { user: newUser }
  }
}
