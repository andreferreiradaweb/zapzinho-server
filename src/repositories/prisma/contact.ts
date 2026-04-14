import { Prisma } from '@/lib/prisma'
import { prisma } from '@/lib/prisma'
import { ContactRepository } from '../contact'

export class PrismaContactRepository implements ContactRepository {
  async findById(id: string) {
    return prisma.contact.findUnique({ where: { id } })
  }

  async findByPhone(userId: string, phone: string) {
    return prisma.contact.findFirst({ where: { userId, phone } })
  }

  async countByUserId(userId: string, search: string, tag?: string) {
    return prisma.contact.count({
      where: {
        userId,
        isActive: true,
        ...(tag ? { tags: { has: tag } } : {}),
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
    })
  }

  async filterByUserId(
    userId: string,
    offset: number,
    limit: number,
    search: string,
    tag?: string,
  ) {
    return prisma.contact.findMany({
      where: {
        userId,
        isActive: true,
        ...(tag ? { tags: { has: tag } } : {}),
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      skip: Number(offset),
      take: Number(limit),
    })
  }

  async findAllByUserIdAndTags(userId: string, tags: string[]) {
    if (tags.length === 0) {
      return this.findAllActiveByUserId(userId)
    }
    return prisma.contact.findMany({
      where: {
        userId,
        isActive: true,
        tags: { hasSome: tags },
      },
    })
  }

  async findAllActiveByUserId(userId: string) {
    return prisma.contact.findMany({
      where: { userId, isActive: true },
    })
  }

  async create(data: Prisma.ContactUncheckedCreateInput) {
    return prisma.contact.create({ data })
  }

  async createMany(data: Prisma.ContactUncheckedCreateInput[]) {
    const result = await prisma.contact.createMany({ data, skipDuplicates: true })
    return result.count
  }

  async update(data: Prisma.ContactUncheckedUpdateInput & { id: string }) {
    return prisma.contact.update({ where: { id: data.id }, data })
  }

  async delete(id: string) {
    return prisma.contact.delete({ where: { id } })
  }
}
