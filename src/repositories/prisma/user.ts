import { Plan, Prisma, Role } from '@prisma/client'
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
          {
            Company: {
              some: {
                document: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            Company: {
              some: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
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
    plan: Plan,
    role: Role,
  ) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            domain: {
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
          {
            Company: {
              some: {
                document: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            Company: {
              some: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
        Plan: {
          equals: plan,
        },
        Role: {
          equals: role,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        Company: {
          include: {
            House: true,
          },
        },
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
    const { email, id, phoneNumber, isActive, domain } =
      await prisma.user.create({
        data,
      })
    return {
      email,
      id,
      phoneNumber,
      isActive,
      domain,
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
