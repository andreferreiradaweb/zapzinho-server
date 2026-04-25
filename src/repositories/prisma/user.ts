import { Prisma, Role } from '@/lib/prisma'
import { UserRepository } from '../user'
import { prisma } from '@/lib/prisma'

export class PrismaUserRepository implements UserRepository {
  async countUsers(search: string) {
    const isDigitsOnly = search && /^\d+$/.test(search)

    if (isDigitsOnly) {
      const result = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM "User"
        WHERE REGEXP_REPLACE(COALESCE("phoneNumber", ''), '[^0-9]', '', 'g') LIKE ${`%${search}%`}
      `
      return Number(result[0]?.count ?? 0)
    }

    const count = await prisma.user.count({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { phoneNumber: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
    })
    return count
  }

  async filterUsers(
    offset: number,
    limit: number,
    search: string,
    role?: Role,
  ) {
    const isDigitsOnly = search && /^\d+$/.test(search)

    if (isDigitsOnly) {
      const matched = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "User"
        WHERE REGEXP_REPLACE(COALESCE("phoneNumber", ''), '[^0-9]', '', 'g') LIKE ${`%${search}%`}
        ${role ? Prisma.sql`AND "Role" = ${role}::"Role"` : Prisma.empty}
      `
      const ids = matched.map((r) => r.id)
      if (ids.length === 0) return []

      const users = await prisma.user.findMany({
        where: { id: { in: ids } },
        orderBy: { createdAt: 'desc' },
        skip: Number(offset),
        take: Number(limit),
        include: {
          Leads: { select: { id: true } },
          Products: { select: { id: true } },
        },
      })
      return users || []
    }

    const users = await prisma.user.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(role ? { Role: { equals: role } } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: Number(offset),
      take: Number(limit),
      include: {
        Leads: { select: { id: true } },
        Products: { select: { id: true } },
      },
    })
    return users || []
  }

  async findUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        Leads: true,
        Products: true,
      },
    })

    return user || null
  }

  async update(data: Prisma.UserUncheckedCreateInput) {
    const user = await prisma.user.update({
      where: {
        id: String(data.id),
      },
      data,
    })
    return user
  }

  async findUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user || null
  }

  async findUserByInstanceId(instanceId: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { wapiInstanceId: instanceId },
          { prospectingInstanceId: instanceId },
        ],
      },
    })
    return user || null
  }

  async findUserByPhone(phone: string) {
    const last8 = phone.replace(/\D/g, '').slice(-8)
    if (last8.length < 8) return null
    const users = await prisma.user.findMany({
      where: { phoneNumber: { not: null } },
    })
    return users.find((u) => (u.phoneNumber ?? '').replace(/\D/g, '').endsWith(last8)) ?? null
  }

  async findAdminUser() {
    const user = await prisma.user.findFirst({
      where: { Role: 'ADMIN' },
    })
    return user || null
  }

  async create(data: Prisma.UserUncheckedCreateInput) {
    const { email, id, phoneNumber, isActive } =
      await prisma.user.create({
        data,
      })
    return {
      email,
      id,
      phoneNumber,
      isActive,
    }
  }

  async delete(userId: string) {
    const user = await prisma.user.delete({
      where: {
        id: userId,
      },
    })
    return user
  }
}
