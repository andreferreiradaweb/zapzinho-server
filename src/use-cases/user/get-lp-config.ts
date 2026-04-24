import { UserRepository } from '@/repositories/user'
import { ResourceNotFound } from '@/error/resource-not-found'

interface GetLpConfigRequest {
  userId: string
}

interface GetLpConfigResponse {
  lpPhoneParam: string
  lpNameParam: string
}

export class GetLpConfigUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ userId }: GetLpConfigRequest): Promise<GetLpConfigResponse> {
    const user = await this.userRepository.findUserById(userId)

    if (!user) throw new ResourceNotFound()

    return {
      lpPhoneParam: user.lpPhoneParam ?? 'whatsappnumber',
      lpNameParam: user.lpNameParam ?? 'customername',
    }
  }
}
