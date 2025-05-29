import { House, Company, Plan, Prisma, Role, User } from '@prisma/client'

interface CompanyWithHouse extends Company {
  House: House[]
}

interface UserWithCompany extends User {
  Company: CompanyWithHouse[]
}

interface UserSerialized {
  id: string
  email: string
  phoneNumber: string | null
  isActive: boolean
  domain: string | null
}

export interface UserRepository {
  findUserById(id: string): Promise<User | null>
  findUserByEmail(email: string): Promise<User | null>
  countUsers(search: string): Promise<number>
  filterUsers(
    offset: number,
    limit: number,
    search: string,
    plan?: Plan,
    role?: Role,
  ): Promise<UserWithCompany[]>
  create(data: Prisma.UserUncheckedCreateInput): Promise<UserSerialized>
  update(data: Prisma.UserUncheckedCreateInput): Promise<User>
  delete(id: string): Promise<User>
}
