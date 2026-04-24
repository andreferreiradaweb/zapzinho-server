import { UserRepository, UserWithLeadsAndProducts } from '@/repositories/user'

type UserRecord = {
  id: string
  email: string
  passwordHash: string
  name: string | null
  phoneNumber: string | null
  address: string | null
  isActive: boolean
  emailVerified: boolean
  Role: string
  CustomerType: string
  Plan: string
  trialExpiresAt: Date | null
  onboardingMessageSentAt: Date | null
  wapiInstanceId: string | null
  wapiToken: string | null
  prospectingInstanceId: string | null
  prospectingToken: string | null
  createdAt: Date
}

export class InMemoryUserRepository implements UserRepository {
  public items: UserRecord[] = []

  async findUserById(id: string): Promise<UserWithLeadsAndProducts | null> {
    const user = this.items.find((u) => u.id === id)
    if (!user) return null
    return { ...(user as any), Leads: [], Products: [] }
  }

  async findUserByEmail(email: string): Promise<any> {
    return this.items.find((u) => u.email === email) ?? null
  }

  async findUserByInstanceId(instanceId: string): Promise<any> {
    return this.items.find((u) => u.wapiInstanceId === instanceId) ?? null
  }

  async findUserByPhone(phone: string): Promise<any> {
    const last8 = phone.replace(/\D/g, '').slice(-8)
    if (last8.length < 8) return null
    return this.items.find((u) => (u.phoneNumber ?? '').replace(/\D/g, '').endsWith(last8)) ?? null
  }

  async findAdminUser(): Promise<any> {
    return this.items.find((u) => u.Role === 'ADMIN') ?? null
  }

  async countUsers(search: string): Promise<number> {
    return this.items.filter((u) => u.email.includes(search)).length
  }

  async filterUsers(offset: number, limit: number, search: string, role?: string): Promise<any[]> {
    return this.items
      .filter((u) => !role || u.Role === role)
      .filter((u) => u.email.includes(search))
      .slice(offset, offset + limit)
  }

  async create(data: any): Promise<any> {
    const user: UserRecord = {
      id: data.id,
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name ?? null,
      phoneNumber: data.phoneNumber ?? null,
      address: data.address ?? null,
      isActive: data.isActive ?? true,
      emailVerified: data.emailVerified ?? false,
      Role: data.Role,
      CustomerType: data.CustomerType ?? 'B2C',
      Plan: 'PADRAO',
      trialExpiresAt: null,
      onboardingMessageSentAt: null,
      wapiInstanceId: data.wapiInstanceId ?? null,
      wapiToken: data.wapiToken ?? null,
      prospectingInstanceId: data.prospectingInstanceId ?? null,
      prospectingToken: data.prospectingToken ?? null,
      createdAt: new Date(),
    }
    this.items.push(user)
    return { id: user.id, email: user.email, phoneNumber: user.phoneNumber, isActive: user.isActive }
  }

  async update(data: any): Promise<any> {
    const idx = this.items.findIndex((u) => u.id === data.id)
    if (idx === -1) throw new Error('User not found')
    this.items[idx] = { ...this.items[idx], ...data }
    return this.items[idx]
  }

  async delete(id: string): Promise<any> {
    const idx = this.items.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error('User not found')
    const [user] = this.items.splice(idx, 1)
    return user
  }
}
