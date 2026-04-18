import { prisma } from '@/lib/prisma'
import { BroadcastBlockRepository } from '../broadcast-block'

export class PrismaBroadcastBlockRepository implements BroadcastBlockRepository {
  async findByUserId(userId: string, offset: number, limit: number) {
    return prisma.broadcastBlock.findMany({
      where: { userId },
      include: { Lead: true },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    })
  }

  async countByUserId(userId: string) {
    return prisma.broadcastBlock.count({ where: { userId } })
  }

  async add(userId: string, leadId: string) {
    return prisma.broadcastBlock.upsert({
      where: { userId_leadId: { userId, leadId } },
      create: { userId, leadId },
      update: {},
    })
  }

  async remove(userId: string, leadId: string) {
    await prisma.broadcastBlock.deleteMany({ where: { userId, leadId } })
  }

  async findBlockedLeadIds(userId: string) {
    const blocks = await prisma.broadcastBlock.findMany({
      where: { userId },
      select: { leadId: true },
    })
    return blocks.map((b) => b.leadId)
  }
}
