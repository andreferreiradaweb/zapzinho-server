import { Role, User } from '@/lib/prisma'

import { UserRepository } from '@/repositories/user'

interface ListUsersUseCaseRequest {
  page?: number
  limit?: number
  search?: string
  role?: Role
}

interface ListUsersUseCaseResponse {
  totalItems: number
  currentPage: number
  itemsPerPage: number
  users: Omit<User, 'passwordHash'>[] | []
}

export class ListUsersUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute({
    page = 1,
    limit = 10,
    search = '',
    role,
  }: ListUsersUseCaseRequest): Promise<ListUsersUseCaseResponse> {
    const totalItems = await this.userRepository.countUsers(search)

    const offset = (page - 1) * limit

    const users = await this.userRepository.filterUsers(
      offset,
      limit,
      search,
      role,
    )

    const usersWithoutPasswordHash = users.map((user) => {
      const { passwordHash, ...userWithoutPasswordHash } = user
      return userWithoutPasswordHash
    })

    return {
      totalItems,
      currentPage: page,
      itemsPerPage: limit,
      users: usersWithoutPasswordHash,
    }
  }
}
