import { Company, Plan, Role, House } from '@prisma/client'

import { UserRepository } from '@/repositories/user'

interface ListUsersUseCaseRequest {
  page?: number
  limit?: number
  search?: string
  plan?: Plan
  role?: Role
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

interface CompanyWithHouse extends Company {
  House: House[]
}

interface UserWithCompany extends User {
  Company: CompanyWithHouse[]
}

interface ListUsersUseCaseResponse {
  totalItems: number
  currentPage: number
  itemsPerPage: number
  users: UserWithCompany[] | []
}

export class ListUsersUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute({
    page = 1,
    limit = 10,
    search = '',
    plan,
    role,
  }: ListUsersUseCaseRequest): Promise<ListUsersUseCaseResponse> {
    const totalItems = await this.userRepository.countUsers(search)

    const offset = (page - 1) * limit

    const users = await this.userRepository.filterUsers(
      offset,
      limit,
      search,
      plan,
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
