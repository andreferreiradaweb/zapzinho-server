import { User } from '@/lib/prisma'
import { UserRepository } from '@/repositories/user'
import { ResourceNotFound } from '@/error/resource-not-found'

interface UpdateRagSettingsRequest {
  userId: string
  ragAutoReplyEnabled: boolean
}

export class UpdateRagSettingsUseCase {
  constructor(private repo: UserRepository) {}

  async execute({ userId, ragAutoReplyEnabled }: UpdateRagSettingsRequest): Promise<User> {
    const user = await this.repo.findUserById(userId)
    if (!user) throw new ResourceNotFound()

    return this.repo.update({
      id: userId,
      email: user.email,
      Role: user.Role,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      CustomerType: user.CustomerType,
      wapiInstanceId: user.wapiInstanceId,
      ragAutoReplyEnabled,
    })
  }
}
