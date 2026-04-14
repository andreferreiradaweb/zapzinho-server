import { MessageType, Prisma } from '@/lib/prisma'
import { prisma } from '@/lib/prisma'
import { MessageLogRepository } from '../message-log'

export class PrismaMessageLogRepository implements MessageLogRepository {
  async create(data: Prisma.MessageLogUncheckedCreateInput) {
    return prisma.messageLog.create({ data })
  }

  async findAllByUserId(userId: string, offset: number, limit: number, type?: MessageType) {
    return prisma.messageLog.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
      skip: Number(offset),
      take: Number(limit),
    })
  }

  async countByUserId(userId: string, type?: MessageType) {
    return prisma.messageLog.count({
      where: { userId, ...(type ? { type } : {}) },
    })
  }

  async markSent(id: string) {
    await prisma.messageLog.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    })
  }

  async markFailed(id: string, errorMsg: string) {
    await prisma.messageLog.update({
      where: { id },
      data: { status: 'FAILED', errorMsg },
    })
  }
}
