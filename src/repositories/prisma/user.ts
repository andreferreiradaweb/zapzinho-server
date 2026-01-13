import { Prisma, Role } from '@/lib/prisma'
import { UserRepository } from '../user'
import { prisma } from '@/lib/prisma'

export class PrismaUserRepository implements UserRepository {
  async countUsers(search: string) {
    const count = await prisma.user.count({
      where: {
        OR: [
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            phoneNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    })
    return count
  }

  async filterUsers(
    offset: number,
    limit: number,
    search: string,
    role: Role,
  ) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            phoneNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
        Role: {
          equals: role,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: Number(offset),
      take: Number(limit),
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
      where: {
        email,
      },
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
