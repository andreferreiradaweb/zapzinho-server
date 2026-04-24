import { UserRepository } from '@/repositories/user'
import { ResourceNotFound } from '@/error/resource-not-found'

interface GetLpConfigRequest {
  userId: string
}

interface GetLpConfigResponse {
  msgVar1: string | null
  msgVar2: string | null
}

export class GetLpConfigUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ userId }: GetLpConfigRequest): Promise<GetLpConfigResponse> {
    const user = await this.userRepository.findUserById(userId)

    if (!user) throw new ResourceNotFound()

    return {
      msgVar1: user.msgVar1 ?? null,
      msgVar2: user.msgVar2 ?? null,
    }
  }
}
