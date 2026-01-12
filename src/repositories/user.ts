import { Lead, Prisma, Role, User } from '@/lib/prisma'
import { Product } from 'generated/prisma/browser'

interface UserSerialized {
  id: string
  email: string
  phoneNumber: string | null
  isActive: boolean
  domain: string | null
}

export interface UserWithLeadsAndProducts extends User {
  Leads: Lead[]
  Products: Product[]
}

export interface UserRepository {
  findUserById(id: string): Promise<UserWithLeadsAndProducts | null>
  findUserByEmail(email: string): Promise<User | null>
  countUsers(search: string): Promise<number>
  filterUsers(
    offset: number,
    limit: number,
    search: string,
    role?: Role,
  ): Promise<User[]>
  create(data: Prisma.UserUncheckedCreateInput): Promise<UserSerialized>
  update(data: Prisma.UserUncheckedCreateInput): Promise<User>
  delete(id: string): Promise<User>
}
