import { prisma } from '@/lib/prisma'
import { BroadcastBlockRepository } from '../broadcast-block'

export class PrismaBroadcastBlockRepository implements BroadcastBlockRepository {
  async findByUserId(userId: string, offset: number, limit: number) {
    return prisma.broadcastBlock.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    })
  }

  async countByUserId(userId: string) {
    return prisma.broadcastBlock.count({ where: { userId } })
  }

  async add(userId: string, phone: string, name?: string) {
    return prisma.broadcastBlock.upsert({
      where: { userId_phone: { userId, phone } },
      create: { userId, phone, name },
      update: { name },
    })
  }

  async remove(userId: string, id: string) {
    await prisma.broadcastBlock.deleteMany({ where: { userId, id } })
  }

  async findBlockedPhones(userId: string) {
    const blocks = await prisma.broadcastBlock.findMany({
      where: { userId },
      select: { phone: true },
    })
    return blocks.map((b) => b.phone)
  }
}
